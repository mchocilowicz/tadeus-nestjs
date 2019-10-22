import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './module/app/app.module';
import { Const } from "./common/util/const";
import { LoggerService } from "./common/service/logger.service";
import { i18nMiddleware } from "./common/middleware/i18n.middleware";
import { TadeusValidationPipe } from "./common/pipe/tadeus-validation.pipe";
import { ClientModule } from "./module/client/client.module";
import { PartnerModule } from "./module/partner/partner.module";
import { DashboardModule } from "./module/dashboard/dashboard.module";
import { join } from "path";
import morgan = require("morgan");

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new LoggerService(Const.APP_NAME)
    });

    const options = new DocumentBuilder()
        .setTitle(Const.APP_NAME)
        .setDescription('The TADEUS API description')
        .setVersion('1.0')
        .build();

    const clientDocument = SwaggerModule.createDocument(app, options, {
        include: [ClientModule],
    });
    SwaggerModule.setup('api/docs/client', app, clientDocument);

    const partnerDocument = SwaggerModule.createDocument(app, options, {
        include: [PartnerModule],
    });
    SwaggerModule.setup('api/docs/partner', app, partnerDocument);

    const dashboardDocument = SwaggerModule.createDocument(app, options, {
        include: [DashboardModule],
    });
    SwaggerModule.setup('api/docs/dashboard', app, dashboardDocument);


    app.enableCors();
    app.use(helmet());
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    }));
    app.use(compression());
    app.use(morgan('combined'));

    app.use(i18nMiddleware);
    app.useGlobalPipes(new TadeusValidationPipe());
    app.useStaticAssets(join(__dirname, '..', 'public', 'image'));
    app.useStaticAssets(join(__dirname, '..', 'public', 'excel'));
    app.useStaticAssets(join(__dirname, '..', 'public', 'import'));

    const port = process.env.PORT ? process.env.PORT : 4000;
    await app.listen(port);
}

bootstrap();
