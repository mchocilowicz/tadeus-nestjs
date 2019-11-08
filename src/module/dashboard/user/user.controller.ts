import {Controller, Get, NotFoundException, Param} from "@nestjs/common";
import {RoleEnum} from "../../../common/enum/role.enum";
import {User} from "../../../database/entity/user.entity";
import {Status} from "../../../common/enum/status.enum";
import {ApiUseTags} from "@nestjs/swagger";

@Controller()
@ApiUseTags('user')
export class UserController {

    @Get()
    async getAllUsers() {
        const users: User[] = await User.createQueryBuilder('user')
            .leftJoinAndSelect(`user.accounts`, 'accounts')
            .leftJoinAndSelect('accounts.role', 'role')
            .leftJoinAndSelect('user.details', 'details')
            .where(`role.value = :role`, {role: RoleEnum.CLIENT})
            .andWhere('accounts.status = :status', {status: Status.ACTIVE})
            .getMany();
        return users.map((user: User) => {
            if (user.details && user.accounts) {
                return {
                    id: user.id,
                    phone: user.phone,
                    name: user.details.name,
                    email: user.details.email,
                    xp: user.details.xp,
                    account: user.accounts.find(a => a.role.value === RoleEnum.CLIENT),
                    updatedDate: user.details.updatedAt
                }
            }

        })
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        let user = await User.findOne({id: id}, {relations: ['details', 'transactions', 'donations']});
        if (!user) {
            throw new NotFoundException('user_not_exists')
        }
        return user;
    }
}
