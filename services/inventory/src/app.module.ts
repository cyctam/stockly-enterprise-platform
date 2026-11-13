import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MaterialsModule } from "./materials/materials.module";
import { StockMovementsModule } from "./stock-movements/stock-movements.module";
import { AlertsModule } from "./alerts/alerts.module";
import { HealthModule } from "./health/health.module";
import { StockEventsModule } from "./stock-events/stock-events.module";
import { GrpcModule } from "./grpc/grpc.module";
import { MaterialEntity } from "./materials/material.entity";
import { StockMovementEntity } from "./stock-movements/stock-movement.entity";
import { StockAlertEntity } from "./alerts/stock-alert.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST") || "localhost",
        port: Number(configService.get<string>("DB_PORT") || 5432),
        username: configService.get<string>("DB_USER") || "postgres",
        password: configService.get<string>("DB_PASSWORD") || "postgres",
        database: configService.get<string>("DB_NAME") || "inventory",
        entities: [MaterialEntity, StockMovementEntity, StockAlertEntity],
        synchronize: configService.get<string>("DB_SYNC") === "true",
        logging: configService.get<string>("DB_LOGGING") === "true",
      }),
    }),
    MaterialsModule,
    StockMovementsModule,
    AlertsModule,
    HealthModule,
    StockEventsModule,
    GrpcModule,
  ],
})
export class AppModule {}
