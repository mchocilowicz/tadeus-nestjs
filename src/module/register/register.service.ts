import { RegisterPhoneDto } from "../../dto/registerPhone.dto";
import { User } from "../../database/entity/user.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { UserInformationDto } from "../../dto/userInformation.dto";
import { VirtualCard } from "../../database/entity/virtual-card.entity";
import { Role } from "../../database/entity/role.entity";
import { RoleEnum } from "../../common/enum/role.enum";
import { VerifyUserDto } from "../../dto/verifyUser.dto";

const uuidv4 = require('uuid/v4');

@Injectable()
export class RegisterService {
    constructor() {
    }

    async createUser(phone: RegisterPhoneDto): Promise<void> {
        let user = await User.findOne({phone: phone.phone}, {relations: ['roles']});
        let anonymousUser = await User.findOne({id: phone.anonymousKey}, {relations: ['roles']});
        if (user && user.registered) {
            throw new BadRequestException("User with this phone already exists")
        } else {
            if (anonymousUser) {
                await this.registerUser(anonymousUser)
            } else if (user) {
                await this.registerUser(user)
            } else {
                let user = new User();
                user.phone = phone.phone;
                await this.registerUser(user)
            }
        }
    }

    async fillUserInformation(dto: UserInformationDto): Promise<void> {
        let user = await User.findOne({phone: dto.phone});
        if (user === null) {
            throw new NotFoundException('User does not exists.')
        }
        if (user.registered) {
            throw new BadRequestException("User is already fully registered")
        } else {
            user.email = dto.email;
            user.name = dto.name;
            user.registered = true;
            user.xp = 50;

            const virtualCard = new VirtualCard();
            virtualCard.cardNumber = this.generateVirtualCardNumber();

            try {
                user.virtualCard = await virtualCard.save();
                await user.save();
            } catch (e) {
                throw new BadRequestException("Could not create user.")
            }
        }

    }

    private async registerUser(user: User) {
        let role = await Role.findOne({name: RoleEnum.CLIENT});
        if (!role) {
            throw new BadRequestException('could not create user')
        }
        if (user.roles) {
            user.roles.push(role);
        } else {
            user.roles = [role]
        }
        user.code = this.generateCode();
        // await user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        try {
            await user.save()
        } catch (e) {
            throw new BadRequestException('could not create user ')
        }
    }

    async checkCode(dto: VerifyUserDto) {
        let user = await User.findOne({phone: dto.phone, code: dto.code});
        if (!user) {
            throw new NotFoundException('Verifycation code is invalid')
        }
    }

    private generateVirtualCardNumber(): string {
        const result = ['VRC', this.generateCode()];
        let uuid: string = uuidv4();
        let list: string[] = uuid.split('-');
        result.push(list[0], list[list.length - 1]);
        return result.join('-');
    }

    private generateCode(): number {
        const min = Math.ceil(1000);
        const max = Math.floor(9999);
        // return Math.floor(Math.random() * (max - min + 1)) + min;
        return 1234;
    }
}
