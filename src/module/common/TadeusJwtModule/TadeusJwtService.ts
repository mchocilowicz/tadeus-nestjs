import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TadeusJwtService {
    constructor(private readonly jwtService: JwtService) {
    }

    signToken(identity: any): string {
        return this.jwtService.sign(identity);
    }

}
