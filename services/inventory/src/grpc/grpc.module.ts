import { Module } from "@nestjs/common";
import { ProcurementGrpcController } from "./procurement.grpc.controller";
import { MaterialsModule } from "../materials/materials.module";

@Module({
  imports: [MaterialsModule],
  controllers: [ProcurementGrpcController],
})
export class GrpcModule {}
