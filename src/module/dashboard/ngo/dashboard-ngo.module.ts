import { Module } from "@nestjs/common";
import { DashboardNgoController } from "./dashboard-ngo.controller";
import { MulterModule } from "@nestjs/platform-express";
import { join } from "path";
import { diskStorage } from "multer";

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
    controllers: [DashboardNgoController]
})
export class DashboardNgoModule {
}
