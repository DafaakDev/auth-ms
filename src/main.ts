import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger, ValidationPipe} from "@nestjs/common";
import {Transport} from "@nestjs/microservices";
import {envs} from "./config";

async function bootstrap() {
    const logger = new Logger('AUTH-MS');
    //todo
    // hacerlo microservicio y conectarlo con el gateway
    // configurar docker
    // envs

    const app = await NestFactory.createMicroservice(AppModule,
        {
            transport: Transport.NATS,
            options: {
                servers: [envs.natsServer],
            },
        }
    );


    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    await app.listen();
    logger.log(`AUTH-MS running on port ${envs.port}`);
}

bootstrap();
