import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import {RoleEnum} from "../../../common/enum/role.enum";
import {User} from "../../../database/entity/user.entity";
import {ApiBearerAuth, ApiHeader, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";
import {UserResponse} from "../../../models/dashboard/response/user.response";
import {Status} from "../../../common/enum/status.enum";
import {UserViewResponse} from "../../../models/dashboard/response/user-view.response";
import {Phone} from "../../../database/entity/phone.entity";
import {EntityManager, getConnection} from "typeorm";
import {VirtualCard} from "../../../database/entity/virtual-card.entity";
import {Opinion} from "../../../database/entity/opinion.entity";
import {Account} from "../../../database/entity/account.entity";
import {Roles} from "../../../common/decorators/roles.decorator";
import {JwtAuthGuard} from "../../../common/guards/jwt.guard";
import {RolesGuard} from "../../../common/guards/roles.guard";
import {Const} from "../../../common/util/const";

const moment = require('moment');

@Controller()
@ApiTags('user')
@ApiBearerAuth()
@ApiHeader(Const.SWAGGER_AUTHORIZATION_HEADER)
export class UserController {

    @Get()
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiResponse({status: 200, isArray: true, type: UserResponse})
    @ApiQuery({name: 'updatedFrom', type: Date, description: 'updated from', required: false})
    @ApiQuery({name: 'updatedTo', type: Date, description: 'updated to', required: false})
    @ApiQuery({name: 'xpMin', type: Number, description: '', required: false})
    @ApiQuery({name: 'xpMax', type: Number, description: '', required: false})
    @ApiQuery({name: 'prefix', type: Number, description: '', required: false})
    @ApiQuery({name: 'phone', type: Number, description: '', required: false})
    async getAllUsers(@Query() query: {
        updatedFrom: Date
        updatedTo: Date
        xpMin: number
        xpMax: number
        prefix: number
        phone: number
        status: string
    }) {
        let sqlQuery = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('user.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.status != :status', {status: Status.DELETED});

        if (query.xpMin && query.xpMax && (Number(query.xpMin) > Number(query.xpMax) || Number(query.xpMax) < Number(query.xpMin))) {
            throw new BadRequestException('query_xp_mismatch')
        }

        if (query.updatedFrom && query.updatedTo && moment(query.updatedTo).isBefore(query.updatedFrom)) {
            throw new BadRequestException('query_updated_at_mismatch')
        }

        if (query.xpMin) {
            sqlQuery = sqlQuery.andWhere('user.xp >= :xpMin', {xpMin: Number(query.xpMin)});
        }
        if (query.xpMax) {
            sqlQuery = sqlQuery.andWhere('user.xp <= :xpMax', {xpMax: Number(query.xpMax)});
        }
        if (query.prefix && query.phone) {
            sqlQuery = sqlQuery.andWhere('phone.value = :phone', {phone: query.phone})
                .andWhere('prefix.value = :prefix', {prefix: query.prefix});
        }
        if (query.status) {
            sqlQuery = sqlQuery.andWhere('account.status = :status', {status: query.status});
        }
        if (query.updatedFrom) {
            sqlQuery = sqlQuery.andWhere('user.updatedAt >= :from', {from: moment(query.updatedFrom).toISOString()});
        }
        if (query.updatedTo) {
            sqlQuery = sqlQuery.andWhere('user.updatedAt <= :to', {to: moment(query.updatedTo).toISOString()});
        }

        const users: User[] = await sqlQuery.getMany();

        return users.map((user: User) => {
            return new UserResponse(user);
        });
    }

    @Get('status')
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getUserStatus() {
        return Object.keys(Status)
    }

    @Get('opinion')
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getUsersOpinion() {
        return await Opinion.createQueryBuilder("o")
            .leftJoinAndSelect("o.user", 'user')
            .leftJoin("o.tradingPoint", 'point')
            .leftJoinAndSelect("user.phone", "phone")
            .leftJoinAndSelect("phone.prefix", "prefix")
            .where("point is null")
            .select("o.value", "value")
            .addSelect("o.email", "email")
            .addSelect("prefix.value", "prefix")
            .addSelect("phone.value", "phone")
            .addSelect("user.name", "name")
            .addSelect("o.createdAt", "createdAt")
            .getRawMany();
    }

    @Get(':ID')
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async getUserById(@Param('ID') id: string) {
        let user: User | undefined = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('user.phone', 'phone')
            .leftJoinAndSelect('user.transactions', 'transaction')
            .leftJoinAndSelect('user.donations', 'donation')
            .leftJoinAndSelect('donation.ngo', 'donationNgo')
            .leftJoinAndSelect('user.ngo', 'ngo')
            .leftJoinAndSelect('user.card', 'card')
            .leftJoinAndSelect('phone.prefix', 'prefix')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.ID = :ID', {ID: id})
            .getOne();

        if (!user) {
            throw new NotFoundException('user_does_not_exists')
        }

        return new UserViewResponse(user);
    }

    @Put(':ID/transfer')
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async transferUserMoney(@Param('ID') ID: string, @Body() dto: any) {
        let user = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('user.card', 'card')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.ID = :ID', {ID: ID})
            .getOne();

        let targetUser = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('user.card', 'card')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.ID = :ID', {ID: dto.targetID})
            .getOne();

        if (!user || !targetUser) {
            throw new NotFoundException('user_does_not_exists')
        }

        let card: VirtualCard = user.card;
        let targetCard: VirtualCard = targetUser.card;

        targetCard.donationPool += card.donationPool;
        card.donationPool = 0;
        targetCard.personalPool += card.personalPool;
        card.personalPool = 0;

        await getConnection().transaction(async entityManager => {
            await entityManager.save(card);
            await entityManager.save(targetCard);
        })
    }

    @Put(':ID')
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateUserStatus(@Param('ID') ID: string, @Body() dto: any) {
        let user = await User.createQueryBuilder('user')
            .leftJoinAndSelect("user.phone", 'phone')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.ID = :ID', {ID: ID})
            .getOne();


        getConnection().transaction(async (entityManager: EntityManager) => {
            if (!user) {
                throw new NotFoundException('user_does_not_exists')
            }

            let account: Account = user.account;
            const newStatus = Object.keys(Status).find(s => s === dto.status);

            if (!newStatus) {
                throw new NotFoundException('status_does_not_exists')
            }
            if (account.status.toUpperCase() !== newStatus) {
                account.status = (<any>Status)[newStatus];
                await entityManager.save(account);
            }

            if (user.phone && dto.phone && dto.prefix) {
                let phone: Phone = user.phone;
                phone.value = dto.phone;
                await entityManager.save(phone)
            }
        })
    }

    @Delete(':ID')
    @Roles(RoleEnum.DASHBOARD)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async deleteUser(@Param('ID') id: string) {
        let user = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('user.card', 'card')
            .leftJoinAndSelect('user.ngo', 'ngo')
            .leftJoinAndSelect('user.phone', 'phone')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.ID = :ID', {ID: id})
            .getOne();

        if (!user) {
            throw new NotFoundException('user_does_not_exists')
        }

        let card = user.card;
        if (card.donationPool > 0 || card.personalPool > 0) {
            throw new BadRequestException('user_transfer_required')
        }

        let account = user.account;
        account.status = Status.DELETED;

        user.phone = undefined;
        user.name = undefined;
        user.email = undefined;
        user.bankAccount = undefined;
        user.lastName = undefined;
        user.ngo = undefined;

        await getConnection().transaction(async entityManager => {
            await entityManager.save(user);
            await entityManager.save(account);
        })
    }
}
