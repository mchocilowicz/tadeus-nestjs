import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './module/app/app.module';
import { join } from 'path';
import { Const } from "./util/const";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
    app.useStaticAssets(join(__dirname, 'dashboard/dist/dashboard'));
    app.setBaseViewsDir(join(__dirname, 'dashboard/dist/dashboard'));

    const port = process.env.PORT ? process.env.PORT : 3000;

    await app.listen(port);
}

bootstrap();
