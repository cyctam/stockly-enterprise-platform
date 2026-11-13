import { Module } from "@nestjs/common";
import { StockEventsService } from "./stock-events.service";
import { MaterialsModule } from "../materials/materials.module";
import { StockEventsController } from "./stock-events.controller";

@Module({
  imports: [MaterialsModule],
  controllers: [StockEventsController],
  providers: [StockEventsService],
  exports: [StockEventsService],
})
export class StockEventsModule {}
