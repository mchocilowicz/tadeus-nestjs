import {User} from "../../../database/entity/user.entity";

export class UserResponse {
    id: string;
    prefix?: number | undefined;
    phone?: number | undefined;
    email: string | undefined;
    xp: number;
    status: string;
    updateAt: Date;

    constructor(user: User) {
        this.id = user.account.ID;
        this.prefix = user.phone ? user.phone.prefix.value : undefined;
        this.phone = user.phone ? user.phone.value : undefined;
        this.email = user.email;
        this.xp = user.xp;
        this.status = user.account.status;
        this.updateAt = user.updatedAt;
    }
}
