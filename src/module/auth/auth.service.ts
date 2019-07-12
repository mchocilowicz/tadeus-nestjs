import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from "../../entity/user.entity";
import { VerifyUserDto } from "../../dto/verifyUser.dto";
import { UserInformationDto } from "../../dto/userInformation.dto";
import { PhoneDto } from "../../dto/phone.dto";
import { JwtService } from "@nestjs/jwt";
import { RoleEnum } from "../../common/enum/role.enum";
import { RegisterPhoneDto } from "../../dto/registerPhone.dto";
import { VirtualCard } from "../../entity/virtual-card.entity";
const uuidv4 = require('uuid/v4');

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {
    }

    async createUser(phone: RegisterPhoneDto): Promise<void> {
        let user = await User.findOne({phone: phone.phone});
        let anonymousUser = await User.findOne({id: phone.anonymousKey});
        if (user && user.registered) {
            throw new BadRequestException("User with this phone already exists")
        } else {
            if (anonymousUser) {
                this.registerUser(anonymousUser)
            } else if (user) {
                this.registerUser(user)
            } else {
                let user = new User();
                user.phone = phone.phone;
                this.registerUser(user)
            }
        }
    }

    async createAnonymousUser(): Promise<string> {
        let user = new User();
        user.role = RoleEnum.ANONYMOUS;
        let savedUser = await user.save();
        return this.jwtService.sign({id: savedUser.id})
    }

    async checkVerificationCode(dto: VerifyUserDto): Promise<string> {
        let user = await User.findOne({phone: dto.phone});
        if (!user) {
            throw new NotFoundException('Verifycation code is invalid')
        }
        return this.jwtService.sign({id: user.id})
    }

    async checkCode(dto: VerifyUserDto) {
        let user = await User.findOne({phone: dto.phone, code: dto.code});
        if (!user) {
            throw new NotFoundException('Verifycation code is invalid')
        }
    }

    async partnerSignIn(phone: PhoneDto): Promise<void> {
        let user = await User.findOne({phone: phone.phone, role: RoleEnum.PARTNER});
        if (!user) {
            throw new NotFoundException(`User with phone: ${phone.phone} does not exists`)
        }
        user.code = this.generateCode();
        // user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        user.save()
    }

    async signIn(phone: PhoneDto): Promise<void> {
        let user = await User.findOne({phone: phone.phone, role: RoleEnum.CLIENT});
        if (!user) {
            throw new NotFoundException(`User with phone: ${phone.phone} does not exists`)
        }
        user.code = this.generateCode();
        // user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        user.save()
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
        user.role = RoleEnum.CLIENT;
        user.code = this.generateCode();
        // await user.save().then(() => this.smsService.sendMessage(user.code, user.phone))
        try {
            await user.save()
        } catch (e) {
            throw new BadRequestException('could not create user ')
        }
    }

    private generateVirtualCardNumber(): string {
        const result = ['VRC', this.generateCode()];
        let uuid: string = uuidv4();
        let list: string[] = uuid.split('-');
        result.push(list[0], list[list.length -1 ]);
        return result.join('-');
    }

    private generateCode(): number {
        const min = Math.ceil(1000);
        const max = Math.floor(9999);
        // return Math.floor(Math.random() * (max - min + 1)) + min;
        return 1234;
    }

}
