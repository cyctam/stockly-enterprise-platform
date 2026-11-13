import { Controller, NotFoundException } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { MaterialsService } from "../materials/materials.service";

interface GetMaterialByIdRequest {
  id: string;
}

interface GetMaterialByNameRequest {
  name: string;
}

interface MaterialResponse {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  status: string;
  updatedAt: string;
}

@Controller()
export class ProcurementGrpcController {
  constructor(private readonly materialsService: MaterialsService) {}

  @GrpcMethod("ProcurementInventoryService", "GetMaterialById")
  async getMaterialById(
    payload: GetMaterialByIdRequest,
  ): Promise<MaterialResponse> {
    const material = await this.materialsService.findOne(payload.id);
    return this.mapToResponse(material);
  }

  @GrpcMethod("ProcurementInventoryService", "GetMaterialByName")
  async getMaterialByName(
    payload: GetMaterialByNameRequest,
  ): Promise<MaterialResponse> {
    const materials = await this.materialsService.findAll();
    const match = materials.find(
      (item) => item.name.toLowerCase() === payload.name.toLowerCase(),
    );

    if (!match) {
      throw new NotFoundException(`Material ${payload.name} not found.`);
    }

    return this.mapToResponse(match);
  }

  private mapToResponse(material: {
    id: string;
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    minStock: number;
    status: string;
    updatedAt: Date;
  }): MaterialResponse {
    return {
      id: material.id,
      name: material.name,
      category: material.category,
      unit: material.unit,
      currentStock: material.currentStock,
      minStock: material.minStock,
      status: material.status,
      updatedAt: material.updatedAt.toISOString(),
    };
  }
}
