import {NestFactory} from '@nestjs/core';
import {AppModule} from './module/app/app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {join} from 'path';
import {Const} from "./util/const";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const options = new DocumentBuilder()
        .setTitle(Const.APP_NAME)
        .setDescription('The TADEUS API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('docs', app, document);

    app.useStaticAssets(join(__dirname, 'dashboard/dist/dashboard'))
    app.setBaseViewsDir(join(__dirname, 'dashboard/dist/dashboard'))

    await app.listen(3000);
}

bootstrap();
