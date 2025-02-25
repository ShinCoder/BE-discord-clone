import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { CustomErrorCode } from 'shared/constants';
import { CustomExceptionFilter } from 'src/exception-filters';
import { CustomException } from 'src/exceptions';
import { AppModule } from 'src/modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        return new CustomException(
          errors[0].constraints[Object.keys(errors[0].constraints)[0]],
          HttpStatus.BAD_REQUEST,
          CustomErrorCode.COMMON__INVALID_DATA_FIELD
        );
      }
    })
  );

  app.useGlobalFilters(new CustomExceptionFilter());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: configService.get<string>('ALLOWED_ORIGIN').split(';')
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/docs', app, documentFactory(), {
    useGlobalPrefix: true
  });

  const port = configService.get<number>('PORT');
  await app.listen(port);
}
bootstrap();
