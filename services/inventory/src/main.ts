import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );
  
  app.enableCors({
    origin: [
      process.env.FRONTEND_ORIGIN,
      'http://localhost:3000', 
      'http://localhost:5173', 
    ].filter(Boolean), 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const port = process.env.PORT || 4001;
  await app.listen(port, '0.0.0.0');
  console.log(`[STOCKLY] Service running on port ${port}`);
}
bootstrap();