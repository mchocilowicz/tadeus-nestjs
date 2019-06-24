import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {User} from "../../entity/user.entity";
import {SmsService} from "./sms.service";
import {VerifyUserDto} from "../../dto/verifyUser.dto";
import {UserInformationDto} from "../../dto/userInformation.dto";
import {PhoneDto} from "../../dto/phone.dto";

@Injectable()
export class AuthService {
    constructor(private readonly smsService: SmsService) {
    }

    async createUser(phone: PhoneDto): Promise<void> {
        let count = await User.count({phone: phone.phone});
        if (count === 0) {
            let user = new User();
            user.phone = phone.phone;
            user.code = this.generateCode();
            await user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        } else {
            throw new BadRequestException("User with this phone already exists")
        }
    }

    async createAnonymousUser(): Promise<string> {
        let user = await new User().save();
        return user.id
    }

    async checkVerificationCode(dto: VerifyUserDto): Promise<void> {
        let user = await User.findOne({phone: dto.phone, code: dto.code});
        if (!user) {
            throw new NotFoundException('Verifycation code is invalid')
        }
    }

    async signIn(phone: string): Promise<void> {
        let user = await User.findOne({phone: phone});
        if (!user) {
            throw new NotFoundException(`User with phone: ${phone} does not exists`)
        }
        user.code = this.generateCode();
        user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
    }

    async fillUserInformation(dto: UserInformationDto): Promise<string> {
        let user = await User.findOne({phone: dto.phone});
        if (!user) {
            throw new NotFoundException('User does not exists.')
        }
        user.email = dto.email;
        user.name = dto.name;
        await user.save();
        return "User successfully created"
    }

    private generateCode(): number {
        const min = Math.ceil(1000);
        const max = Math.floor(9999);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}
