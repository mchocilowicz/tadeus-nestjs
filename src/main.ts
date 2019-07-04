import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './module/app/app.module';
import { join } from 'path';
import { Const } from "./util/const";
import { LoggerService } from "./common/service/logger.service";
import morgan = require("morgan");
import { TadeusExceptionFilter } from "./common/filter/exception.filter";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new LoggerService(Const.APP_NAME)
    });

    const options = new DocumentBuilder()
        .setTitle(Const.APP_NAME)
        .setDescription('The TADEUS API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);

    app.enableCors();
    app.use(helmet());
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    }));
    app.use(compression());
    app.use(morgan('combined'));
    // app.useGlobalFilters(new TadeusExceptionFilter());
    app.useStaticAssets(join(__dirname, '..', 'view/'));
    app.setBaseViewsDir(join(__dirname, '..', 'view/'));

    const port = process.env.PORT ? process.env.PORT : 3000;

    await app.listen(port);
}

bootstrap();
