import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import * as helmet from 'helmet';
import * as compression from 'compression';
import {Const} from "./common/util/const";
import {LoggerService} from "./common/service/logger.service";
import {i18nMiddleware} from "./common/middleware/i18n.middleware";
import {TadeusValidationPipe} from "./common/pipe/tadeus-validation.pipe";
import {ClientModule} from "./module/client/client.module";
import {PartnerModule} from "./module/partner/partner.module";
import {DashboardModule} from "./module/dashboard/dashboard.module";
import {join} from "path";
import {RegisterModule} from "./module/client/register/register.module";
import {PlaceModule} from "./module/client/place/place.module";
import {NgoModule} from "./module/client/ngo/ngo.module";
import {DonationModule} from "./module/client/donation/donation.module";
import {PartnerTransactionModule} from "./module/partner/transaction/partner-transaction.module";
import {PartnerTerminalModule} from "./module/partner/terminal/partner-terminal.module";
import {DashboardNgoModule} from "./module/dashboard/ngo/dashboard-ngo.module";
import {TradingPointModule} from "./module/dashboard/trading-point/trading-point.module";
import {OpinionModule} from "./module/client/opinion/opinion.module";
import {InformationModule} from "./module/client/user/information.module";
import {PayoutModule} from "./module/client/payout/payout.module";
import {PartnerSettingsModule} from "./module/partner/settings/partner-settings.module";
import {PartnerDonationModule} from "./module/partner/donation/partner-donation.module";
import {PartnerOpinionModule} from "./module/partner/opinion/partner-opinion.module";
import {AppModule} from "./module/app.module";
import {ConfigurationModule} from "./module/dashboard/configuration/configuration.module";
import morgan = require("morgan");

async function bootstrap() {

    try {
        require('dotenv').config({
            path: join(__dirname, '..', 'config', '.env')
        });

        const app = await NestFactory.create<NestExpressApplication>(AppModule, {
            logger: new LoggerService(Const.APP_NAME)
        });

        const options = new DocumentBuilder()
            .setTitle(Const.APP_NAME)
            .setDescription('The TADEUS API description')
            .setVersion('1.0')
            .build();

        const clientDocument = SwaggerModule.createDocument(app, options, {
            include: [ClientModule, RegisterModule, PlaceModule, NgoModule, DonationModule, InformationModule, OpinionModule, PayoutModule],
        });
        SwaggerModule.setup('api/docs/client', app, clientDocument);

        const partnerDocument = SwaggerModule.createDocument(app, options, {
            include: [PartnerModule, PartnerTransactionModule, PartnerTerminalModule, PartnerSettingsModule, PartnerDonationModule, PartnerOpinionModule],
        });
        SwaggerModule.setup('api/docs/partner', app, partnerDocument);

        const dashboardDocument = SwaggerModule.createDocument(app, options, {
            include: [DashboardModule, DashboardNgoModule, TradingPointModule, ConfigurationModule],
        });
        SwaggerModule.setup('api/docs/dashboard', app, dashboardDocument);


        app.enableCors();
        app.use(helmet());
        app.use(compression());
        app.use(morgan('combined'));

        app.use(i18nMiddleware);
        app.useGlobalPipes(new TadeusValidationPipe());
        app.useStaticAssets(join(__dirname, '..', 'public', 'image'));
        app.useStaticAssets(join(__dirname, '..', 'public', 'excel'));
        app.useStaticAssets(join(__dirname, '..', 'public', 'import'));
        app.setGlobalPrefix('api');

        const port = process.env.PORT ? process.env.PORT : 4000;
        await app.listen(port);
    } catch (e) {
        console.log(e)
    }
}

bootstrap();
