import { Module } from "@nestjs/common";
import { TradingPointController } from "./trading-point.controller";
import { CodeService } from "../../../common/service/code.service";
import { MulterModule } from "@nestjs/platform-express";
import { join } from "path";
import { diskStorage } from "multer";

const moment = require("moment");

@Module({
    controllers: [TradingPointController],
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: join(__dirname, '../../..', 'upload'),
                filename: (req, file, cb) => {
                    const newFileName = moment().format("YYYYMMDDHHmmss");

                    return cb(null, `${newFileName}_${file.originalname}`)
                }
            })
        }),
    ],
    providers: [CodeService]
})
export class TradingPointModule {
}
