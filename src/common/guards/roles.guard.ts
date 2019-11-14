import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Status } from "../enum/status.enum";
import { Account } from "../../database/entity/account.entity";
import { Terminal } from "../../database/entity/terminal.entity";

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
        const entity: any = request.user;
        const account: Account = entity.account;

        if (!account) {
            return false
        }

        return roles.some(s => account.role.value === s && account.status === Status.ACTIVE) !== null
    }
}

@Injectable()
export class NotPrimaryTerminalRoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const terminal: Terminal = request.user;

        return !terminal.isMain;
    }
}

@Injectable()
export class PrimaryTerminalRoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const terminal: Terminal = request.user;

        return terminal.isMain;
    }
}
