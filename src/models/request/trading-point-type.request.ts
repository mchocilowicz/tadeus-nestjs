import { ApiModelProperty } from "@nestjs/swagger";

export class TradingPointTypeRequest {
    @ApiModelProperty({required: true})
    name: string
}
