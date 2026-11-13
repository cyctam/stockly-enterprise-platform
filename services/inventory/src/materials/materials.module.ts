import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MaterialsController } from "./materials.controller";
import { MaterialsService } from "./materials.service";
import { MaterialsRepository } from "./materials.repository";
import { MaterialEntity } from "./material.entity";
import { AlertsModule } from "../alerts/alerts.module";
import { StockMovementsModule } from "../stock-movements/stock-movements.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([MaterialEntity]),
    AlertsModule,
    StockMovementsModule,
  ],
  controllers: [MaterialsController],
  providers: [MaterialsService, MaterialsRepository],
  exports: [MaterialsService, MaterialsRepository],
})
export class MaterialsModule {}
