import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>("CORS_ORIGIN", "http://localhost:5173"),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = Number.parseInt(configService.get<string>("PORT", "3000"), 10);

  await app.listen(port, "0.0.0.0");
  Logger.log(`Server is running on port ${port}`);
}
bootstrap().catch(handleError);

function handleError(error: unknown) {
  // eslint-disable-next-line no-console
  console.error("❌ Application failed to start:", error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}
