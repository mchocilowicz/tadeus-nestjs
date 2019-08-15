import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { join } from "path";
import { diskStorage } from "multer";
import { TradingPointController } from "./trading-point.controller";

const moment = require("moment");

@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: join(__dirname, '../../../..', 'upload'),
                filename: (req, file, cb) => {
                    const newFileName = moment(new Date()).format("YYYYMMDDHHmmss");

                    return cb(null, `${newFileName}_${file.originalname}`)
                }
            })
        })
    ],
    controllers: [TradingPointController]
})
export class TradingPointModule {
}
