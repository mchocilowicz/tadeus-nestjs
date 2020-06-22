import {BadGatewayException, BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import {Terminal} from "../../entity/terminal.entity";
import {Status, Step} from "../../common/enum/status.enum";
import {EntityManager, getConnection} from "typeorm";
import {TradingPoint} from "../../entity/trading-point.entity";
import {Phone} from "../../entity/phone.entity";
import {PhonePrefix} from "../../entity/phone-prefix.entity";
import {TerminalRequest} from "../../models/common/request/terminal.request";
import {Role} from "../../entity/role.entity";
import {RoleEnum} from "../../common/enum/role.enum";
import {Account} from "../../entity/account.entity";
import {CodeService} from "../../common/service/code.service";
import {TerminalCreateResponse} from "../../models/dashboard/response/terminal-create.response";

@Injectable()
export class TerminalService {
    private readonly logger = new Logger(TerminalService.name);

    constructor(private readonly codeService: CodeService,) {
    }

    async getTerminalsForTradingPoint(terminal: Terminal, tradingPointId: string) {
        let terminals = await Terminal.findAllTerminals(tradingPointId);

        return {
            phone: terminal.phone ? terminal.phone.value : null,
            terminals: terminals
                .filter((t: Terminal) => t.id !== terminal.id)
                .map((t: Terminal) => {
                    return {
                        id: t.id,
                        phone: t.phone ? t.phone.value : null,
                        step: t.step,
                        name: t.name
                    }
                })
        }
    }

    async deleteTerminal(terminalId: string) {
        let terminal: Terminal | undefined = await Terminal.createQueryBuilder('terminal')
            .leftJoinAndSelect('terminal.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('terminal.transactions', 'transaction')
            .where('terminal.id = :id', {id: terminalId})
            .andWhere('account.status = :status', {status: Status.ACTIVE})
            .getOne();

        if (!terminal) {
            throw new NotFoundException(`Terminal with id ${terminalId} does not exists`);
        }

        await getConnection().transaction(async entityManager => {
            if (terminal) {
                terminal.name = '';
                terminal.account.status = Status.DELETED;
                await entityManager.save(terminal);
                await entityManager.save(terminal.account);
            }
        });
    }

    async addNewTerminalToTradingPointByDashboard(id: string, dto: { phone: number, prefix: number, name: string }) {
        return await getConnection().transaction(async entityManager => {
            const role = await Role.findOne({value: RoleEnum.TERMINAL});

            if (!role) {
                this.logger.error('TERMINAL Role does not exists');
                throw new BadRequestException('internal_server_error');
            }

            const terminal = await Terminal.createQueryBuilder('t')
                .leftJoinAndSelect('t.tradingPoint', 'point')
                .leftJoinAndSelect('t.phone', 'phone')
                .leftJoinAndSelect('t.account', 'account')
                .where('phone.value = :phone', {phone: dto.phone})
                .andWhere('point.ID = :ID', {ID: id})
                .getOne();

            if (terminal) {
                let account = terminal.account;
                if (account.status === Status.DELETED) {
                    await this.restoreDeletedTerminal(terminal, dto)
                    return new TerminalCreateResponse(terminal);
                } else {
                    this.logger.error('Terminal is already assigned to Trading Point');
                    throw new BadRequestException('excel_terminal_already_assigned')
                }
            } else {
                const point = await TradingPoint.findOne({ID: id});

                if (!point) {
                    throw new NotFoundException('trading_point_does_not_exists')
                }

                let counts = await Terminal.count({tradingPoint: point});
                const accountID = [point.ID, this.codeService.generateTerminalNumber(counts)].join('-');

                const account = new Account(accountID, role);

                const prefix = await PhonePrefix.findOne({value: dto.prefix});
                if (prefix) {
                    if (dto.phone.toString().length > prefix.maxLength) {
                        throw new BadRequestException('invalid_phone_number')
                    }

                    let phone = new Phone(dto.phone, prefix);
                    const newTerminal = new Terminal(accountID, await entityManager.save(phone), point, await entityManager.save(account));
                    newTerminal.isMain = false;
                    newTerminal.name = dto.name;
                    await entityManager.save(newTerminal);

                    return new TerminalCreateResponse(newTerminal);
                } else {
                    throw new BadRequestException('phone_prefix_does_not_exists')
                }
            }
        });
    }

    async addNewTerminalToTradingPoint(tradingPointId: string, dto: TerminalRequest) {
        let point = await TradingPoint.findOne({id: tradingPointId});

        if (!point) {
            this.logger.error(`Trading Point with id ${tradingPointId} does not exists`);
            throw new NotFoundException('trading_point_does_not_exists')
        }

        let phone = await Phone.findNumber(dto.phonePrefix, dto.phone);
        if (phone) {
            let terminal: Terminal | undefined = await Terminal.createQueryBuilder('terminal')
                .leftJoinAndSelect('terminal.account', 'account')
                .leftJoinAndSelect('terminal.phone', 'phone')
                .leftJoinAndSelect('phone.prefix', 'prefix')
                .leftJoinAndSelect('account.role', 'role')
                .where('phone.value = :phone', {phone: dto.phone})
                .andWhere('prefix.value = :prefix', {prefix: dto.phonePrefix})
                .getOne();

            if (terminal) {
                const account = terminal.account;
                if (account.status === Status.ACTIVE) {
                    throw new BadGatewayException('terminal_active_in_other_trading_point')
                } else if (account.status === Status.DELETED) {
                    await this.restoreDeletedTerminal(terminal, dto)
                }
            } else {
                await getConnection().transaction(async entityManager => {
                    if (phone) {
                        await this.createTerminal(entityManager, phone, dto.name, point)
                    }
                })
            }
        } else {
            await getConnection().transaction(async entityManager => {
                let prefix = await PhonePrefix.findOne({value: dto.phonePrefix});
                if (!prefix) {
                    throw new NotFoundException(`Phone prefix ${dto.phonePrefix} is not supported or does not exists`);
                }
                let phone = new Phone(dto.phone, prefix);
                phone = await entityManager.save(phone);

                await this.createTerminal(entityManager, phone, dto.name, point)
            })
        }
    }

    private async restoreDeletedTerminal(terminal: Terminal, dto: any) {
        terminal.account.status = Status.ACTIVE;
        terminal.step = Step.SIGN_IN;
        terminal.name = dto.name;
        await getConnection().transaction(async entityManager => {
            await entityManager.save(terminal);
            await entityManager.save(terminal.account);
        })
    }

    private async createTerminal(entityManager: EntityManager, phone: Phone, name: string, tradingPoint ?: TradingPoint) {
        if (!tradingPoint) {
            this.logger.error(`Trading Point does not exists`);
            throw new NotFoundException('trading_point_does_not_exists')
        }

        let existingTerminal = await Terminal.findOne({
            tradingPoint: tradingPoint,
            phone: phone
        }, {relations: ['account']});
        if (existingTerminal) {
            existingTerminal.account.status = Status.ACTIVE;
            existingTerminal.name = name;
            await entityManager.save(existingTerminal);
        } else {
            let counts = await Terminal.count({tradingPoint: tradingPoint});
            let role = await Role.findOne({value: RoleEnum.TERMINAL});
            if (!role) {
                throw new NotFoundException('Role TERMINAL does not exists in DB');
            }
            const id = [tradingPoint.ID, this.codeService.generateTerminalNumber(counts)].join('-');

            let terminalAccount = new Account(id, role);

            let terminal = new Terminal(
                id,
                phone,
                tradingPoint,
                await entityManager.save(terminalAccount),
                name
            );
            terminal.isMain = false;
            await entityManager.save(terminal);
        }
    }
}