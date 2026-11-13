import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PurchaseEventsService } from "./purchase-events.service";
import { StockEventsConsumerService } from "./stock-events-consumer.service";
import { PurchaseRequestsModule } from "../purchase-requests/purchase-requests.module"; 

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PurchaseRequestsModule), 
  ],
  providers: [PurchaseEventsService, StockEventsConsumerService],
  exports: [PurchaseEventsService],
})
export class EventsModule {}