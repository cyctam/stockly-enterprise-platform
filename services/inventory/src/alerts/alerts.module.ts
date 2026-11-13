import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AlertsController } from "./alerts.controller";
import { AlertsService } from "./alerts.service";
import { AlertsRepository } from "./alerts.repository";
import { StockAlertEntity } from "./stock-alert.entity";

@Module({
  imports: [TypeOrmModule.forFeature([StockAlertEntity])],
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
  exports: [AlertsService, AlertsRepository],
})
export class AlertsModule {}
