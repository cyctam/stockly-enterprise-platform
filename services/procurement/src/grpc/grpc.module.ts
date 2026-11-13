import { Module } from "@nestjs/common";
import { ClientProxyFactory, Transport } from "@nestjs/microservices";
import { join } from "path";
import { InventoryGrpcService } from "./inventory-grpc.service";
import { PROCUREMENT_INVENTORY_GRPC } from "./grpc.constants";

@Module({
  providers: [
    {
      provide: PROCUREMENT_INVENTORY_GRPC,
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: {
            url: process.env.INVENTORY_GRPC_URL || "localhost:50051",
            package: "endfield.inventory.procurement",
            protoPath: join(__dirname, "procurement.proto"),
          },
        });
      },
    },
    InventoryGrpcService,
  ],
  exports: [PROCUREMENT_INVENTORY_GRPC, InventoryGrpcService],
})
export class GrpcModule {}