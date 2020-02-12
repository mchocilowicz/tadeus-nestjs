import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Put,
    Query
} from "@nestjs/common";
import { RoleEnum } from "../../../common/enum/role.enum";
import { User } from "../../../database/entity/user.entity";
import { ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserResponse } from "../../../models/dashboard/response/user.response";
import { Status } from "../../../common/enum/status.enum";
import { UserViewResponse } from "../../../models/dashboard/response/user-view.response";
import { PhoneRequest } from "../../../models/common/request/phone.request";
import { Phone } from "../../../database/entity/phone.entity";
import { PhonePrefix } from "../../../database/entity/phone-prefix.entity";
import { getConnection } from "typeorm";
import { VirtualCard } from "../../../database/entity/virtual-card.entity";
import { Opinion } from "../../../database/entity/opinion.entity";

const moment = require('moment');

@Controller()
@ApiTags('user')
export class UserController {

    @Get()
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
            .where('role.value = :role', {role: RoleEnum.CLIENT});

        if (query.xpMin && query.xpMax && Number(query.xpMin) > Number(query.xpMax)) {
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
    async getUserStatus() {
        return Object.keys(Status)
    }

    @Get('opinion')
    async getUsersOpinion() {
        return await Opinion.createQueryBuilder("o")
            .leftJoinAndSelect("o.user", 'user')
            .leftJoinAndSelect("user.phone", "phone")
            .leftJoinAndSelect("phone.prefix", "prefix")
            .where("user is not null")
            .select("o.value", "value")
            .addSelect("o.email", "email")
            .addSelect("prefix.value", "prefix")
            .addSelect("phone.value", "phone")
            .addSelect("user.name", "name")
            .addSelect("o.createdAt", "createdAt")
            .getRawMany();
    }

    @Get(':ID')
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
            throw new NotFoundException('user_not_exists')
        }

        return new UserViewResponse(user);
    }

    @Put(':id/phone')
    async updateUserPhone(@Param('id') id: string, @Body() dto: PhoneRequest) {
        let user = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('user.phone', 'phone')
            .leftJoinAndSelect('phone.prefix', 'prefix')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('user.id = :id', {id: id})
            .getOne();

        let phone = await Phone.findClientNumber(dto.phonePrefix, dto.phone);
        if (phone) {
            throw new BadRequestException('phone_already_exists')
        }

        const prefix = await PhonePrefix.findOne({value: dto.phonePrefix});
        if (!prefix) {
            throw new NotFoundException('prefix_does_not_exists')
        }

        return await getConnection().transaction(async entityManager => {
            if (!user) {
                throw new NotFoundException('user_not_exists')
            }

            let newPhone = new Phone(dto.phone, prefix);
            newPhone = await entityManager.save(newPhone);
            user.phone = newPhone;
            await entityManager.save(user);

            return newPhone;
        })
    }

    @Put(':id/transfer/:target')
    async transferUserMoney(@Param('id') id: string, @Param('target') target: string) {
        let user = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('user.card', 'card')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('user.id = :id', {id: id})
            .getOne();

        let targetUser = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .leftJoinAndSelect('user.card', 'card')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('account.ID = :ID', {ID: target})
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

    @Put(':id/status/:status')
    async updateUserStatus(@Param('id') id: string, @Param('status') status: Status) {
        let user = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('user.id = :id', {id: id})
            .getOne();

        if (!user) {
            throw new NotFoundException('user_does_not_exists')
        }

        const s = Object.keys(Status).find(s => s === status);
        if (!s) {
            throw new NotFoundException('status_does_not_exists')
        }

        let account = user.account;
        account.status = status;
        await account.save();
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        let user = await User.createQueryBuilder('user')
            .leftJoinAndSelect('user.account', 'account')
            .leftJoinAndSelect('user.card', 'card')
            .leftJoinAndSelect('user.ngo', 'ngo')
            .leftJoinAndSelect('user.phone', 'phone')
            .leftJoinAndSelect('account.role', 'role')
            .where('role.value = :role', {role: RoleEnum.CLIENT})
            .andWhere('user.id = :id', {id: id})
            .getOne();

        if (!user) {
            throw new NotFoundException('user_does_not_exists')
        }

        let card = user.card;
        if (card.donationPool > 0 || card.personalPool > 0) {
            throw new BadRequestException('transfer_required')
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
