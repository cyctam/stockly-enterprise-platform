import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthModule } from "./health/health.module";
import { PurchaseRequestsModule } from "./purchase-requests/purchase-requests.module";
import { GrpcModule } from "./grpc/grpc.module"; 
import { EventsModule } from "./events/events.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    HealthModule,
    PurchaseRequestsModule,
    GrpcModule,
    EventsModule,
  ],
})
export class AppModule {}