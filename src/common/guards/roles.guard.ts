import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../../database/entity/user.entity";
import { Status } from "../enum/status.enum";
import { Account } from "../../database/entity/account.entity";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user: User = request.user;
        const accounts: Account[] | undefined = user.accounts;

        if (!accounts) {
            return false
        }

        return roles.some(s => accounts.find(a => a.role.value === s && a.status === Status.ACTIVE) !== null)
    }
}
