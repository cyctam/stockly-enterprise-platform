import { Module } from "@nestjs/common";
import { PurchaseRequestsController } from "./purchase-requests.controller";
import { PurchaseRequestsService } from "./purchase-requests.service";
import { PurchaseRequestsRepository } from "./purchase-requests.repository";
import { GrpcModule } from "../grpc/grpc.module";
import { EventsModule } from "../events/events.module";

@Module({
  imports: [GrpcModule, EventsModule],
  controllers: [PurchaseRequestsController],
  providers: [PurchaseRequestsService, PurchaseRequestsRepository],
  exports: [PurchaseRequestsService],
})
export class PurchaseRequestsModule {}