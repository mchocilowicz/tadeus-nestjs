import {NestFactory} from '@nestjs/core';
import {AppModule} from './module/app/app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {Const} from "./util/const";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const options = new DocumentBuilder()
        .setTitle(Const.APP_NAME)
        .setDescription('The TADEUS API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('api', app, document);


    await app.listen(3000);
}

bootstrap();
