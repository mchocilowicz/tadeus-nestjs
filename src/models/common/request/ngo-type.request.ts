import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsNotEmpty } from "class-validator";

export class NgoTypeRequest {
    @ApiProperty({required: true})
    @IsNotEmpty({
        message: "name_required"
    })
    @IsAlpha({
        message: "name_format"
    })
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
