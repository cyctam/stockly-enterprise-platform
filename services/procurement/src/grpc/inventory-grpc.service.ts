import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable, firstValueFrom } from "rxjs";
import { PROCUREMENT_INVENTORY_GRPC } from "./grpc.constants";

interface GetMaterialByIdRequest {
  id: string;
}

interface GetMaterialByNameRequest {
  name: string;
}

export interface MaterialResponse {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  status: string;
  updatedAt: string;
}

interface ProcurementInventoryGrpcClient {
  GetMaterialById(
    request: GetMaterialByIdRequest,
  ): Observable<MaterialResponse>;
  GetMaterialByName(
    request: GetMaterialByNameRequest,
  ): Observable<MaterialResponse>;
}

@Injectable()
export class InventoryGrpcService implements OnModuleInit {
  private readonly logger = new Logger("InventoryGrpcService");
  private client!: ProcurementInventoryGrpcClient;

  constructor(
    @Inject(PROCUREMENT_INVENTORY_GRPC)
    private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.client =
      this.grpcClient.getService<ProcurementInventoryGrpcClient>(
        "ProcurementInventoryService",
      );
  }

  async getMaterialById(id: string): Promise<MaterialResponse> {
    try {
      return await firstValueFrom(this.client.GetMaterialById({ id }));
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          msg: "grpc_get_material_by_id_failed",
          id,
          error: (error as Error)?.message,
        }),
      );
      throw error;
    }
  }

  async getMaterialByName(name: string): Promise<MaterialResponse> {
    try {
      return await firstValueFrom(this.client.GetMaterialByName({ name }));
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          msg: "grpc_get_material_by_name_failed",
          name,
          error: (error as Error)?.message,
        }),
      );
      throw error;
    }
  }
}
