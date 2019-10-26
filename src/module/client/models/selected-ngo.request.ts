import { ApiModelProperty } from "@nestjs/swagger";

export class SelectedNgoRequest {
    @ApiModelProperty()
    id: string;

    constructor(id: string) {
        this.id = id;
    }
}
