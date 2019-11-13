import {ApiModelProperty} from "@nestjs/swagger";

export class ResponseDto<T> {
    @ApiModelProperty()
    error: boolean = false;
    @ApiModelProperty()
    data: T;
    @ApiModelProperty()
    message: string | undefined;

    constructor(data: T) {
        this.data = data;
    }
}
