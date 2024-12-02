import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {  ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true })

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks()
  app.useBodyParser('json', { limit: '256kb' })
  app.useBodyParser('urlencoded', { extended: true, limit: '256kb' })
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
      stopAtFirstError: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )
  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  const config = new DocumentBuilder()
      .setTitle('API de Itens')
      .setDescription('API para gerenciar itens')
      .setVersion('1.0')
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const configService = app.get(ConfigService);
  const uploadDir = configService.get<string>('UPLOADS_FOLDER') || './uploads';

  const PORT = configService.get<number>('PORT') || 3000;

  app.useStaticAssets(join(__dirname, '..', uploadDir), {
    prefix: '/uploads/',
  });

  await app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}
bootstrap();
