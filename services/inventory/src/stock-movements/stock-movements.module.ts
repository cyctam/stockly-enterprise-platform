import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockMovementsController } from "./stock-movements.controller";
import { StockMovementsService } from "./stock-movements.service";
import { StockMovementsRepository } from "./stock-movements.repository";
import { StockMovementEntity } from "./stock-movement.entity";

@Module({
  imports: [TypeOrmModule.forFeature([StockMovementEntity])],
  controllers: [StockMovementsController],
  providers: [StockMovementsService, StockMovementsRepository],
  exports: [StockMovementsService, StockMovementsRepository],
})
export class StockMovementsModule {}
