import { ApiModelProperty } from "@nestjs/swagger";

export class NgoTypeRequest {
    @ApiModelProperty({required: true})
    name: string;
}
