import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from "../../entity/user.entity";
import { VerifyUserDto } from "../../dto/verifyUser.dto";
import { UserInformationDto } from "../../dto/userInformation.dto";
import { PhoneDto } from "../../dto/phone.dto";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../../common/enum/role";
import { RegisterPhoneDto } from "../../dto/registerPhone.dto";

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {
    }

    async createUser(phone: RegisterPhoneDto): Promise<void> {
        let count = await User.count({phone: phone.phone});
        let anonymousUser = await User.findOne({id: phone.anonymousKey});
        if (count === 0) {
            if (anonymousUser) {
                this.registerUser(anonymousUser)
            } else {
                let user = new User();
                user.phone = phone.phone;
                this.registerUser(user)
            }
        } else {
            throw new BadRequestException("User with this phone already exists")
        }
    }

    private async registerUser(user: User) {
        user.role = Role.CLIENT;
        user.code = this.generateCode();
        // await user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        await user.save()
    }

    async createAnonymousUser(): Promise<string> {
        let user = new User();
        user.role = Role.ANONYMOUS;
        let savedUser = await user.save();
        return this.jwtService.sign({id: savedUser.id})
    }

    async checkVerificationCode(dto: VerifyUserDto): Promise<string> {
        let user = await User.findOne({phone: dto.phone, code: dto.code});
        if (!user) {
            throw new NotFoundException('Verifycation code is invalid')
        }
        return this.jwtService.sign({id: user.id})
    }

    async checkCode(dto: VerifyUserDto): Promise<void> {
        let user = await User.findOne({phone: dto.phone, code: dto.code});
        if (!user) {
            throw new NotFoundException('Verifycation code is invalid')
        }
    }

    async signIn(phone: PhoneDto): Promise<void> {
        let user = await User.findOne({phone: phone.phone});
        if (!user) {
            throw new NotFoundException(`User with phone: ${phone.phone} does not exists`)
        }
        user.code = this.generateCode();
        // user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        user.save()
    }

    async fillUserInformation(dto: UserInformationDto): Promise<void> {
        let user = await User.findOne({phone: dto.phone});
        if (!user) {
            throw new NotFoundException('User does not exists.')
        }
        user.email = dto.email;
        user.name = dto.name;
        await user.save();
    }

    private generateCode(): number {
        const min = Math.ceil(1000);
        const max = Math.floor(9999);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}
