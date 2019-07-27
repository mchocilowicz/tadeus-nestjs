import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { User } from "../../database/entity/user.entity";
import { Status } from "../enum/status.enum";

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

        return user.registered &&
            user.status === Status.ACTIVE &&
            roles.some(s => user.roles.find(role => role.name === s) !== null)
    }
}
