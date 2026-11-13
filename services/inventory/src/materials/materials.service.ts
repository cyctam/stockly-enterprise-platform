import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MaterialsRepository } from "./materials.repository";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { UpdateMaterialDto } from "./dto/update-material.dto";
import { StockAdjustmentDto } from "./dto/stock-adjustment.dto";
import { MaterialStatus } from "../common/enums/material-status.enum";
import { StockMovementType } from "../common/enums/stock-movement-type.enum";
import { getStockStatus } from "../common/utils/stock-status.util";
import { AlertsService } from "../alerts/alerts.service";
import { StockMovementsService } from "../stock-movements/stock-movements.service";

export interface MaterialsSummary {
  totalMaterials: number;
  totalStock: number;
  healthyCount: number;
  lowStockCount: number;
  criticalCount: number;
  updatedAt: string;
}

@Injectable()
export class MaterialsService {
  constructor(
    private readonly materialsRepository: MaterialsRepository,
    private readonly alertsService: AlertsService,
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  async findAll() {
    return this.materialsRepository.findAll();
  }

  async findOne(id: string) {
    const material = await this.materialsRepository.findById(id);
    if (!material) {
      throw new NotFoundException(`Material ${id} not found.`);
    }
    return material;
  }

  async create(dto: CreateMaterialDto) {
    this.validateNonNegative(dto.minStock, "minStock");
    const currentStock = dto.currentStock ?? 0;
    this.validateNonNegative(currentStock, "currentStock");

    const status = getStockStatus(currentStock, dto.minStock);

    const created = await this.materialsRepository.create({
      name: dto.name.trim(),
      category: dto.category.trim(),
      unit: dto.unit.trim(),
      currentStock,
      minStock: dto.minStock,
      status,
    });

    await this.alertsService.upsert({
      materialId: created.id,
      currentStock: created.currentStock,
      minStock: created.minStock,
    });

    return created;
  }

  async update(id: string, dto: UpdateMaterialDto) {
    const existing = await this.findOne(id);

    if (dto.minStock !== undefined) {
      this.validateNonNegative(dto.minStock, "minStock");
    }

    const minStock = dto.minStock ?? existing.minStock;
    const status = getStockStatus(existing.currentStock, minStock);

    const updated = await this.materialsRepository.update(id, {
      name: dto.name?.trim(),
      category: dto.category?.trim(),
      unit: dto.unit?.trim(),
      minStock,
      status,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Material ${id} not found.`);
    }

    await this.alertsService.upsert({
      materialId: updated.id,
      currentStock: updated.currentStock,
      minStock: updated.minStock,
    });

    return updated;
  }

  async remove(id: string) {
    const deleted = await this.materialsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Material ${id} not found.`);
    }

    await this.alertsService.removeByMaterialId(id);
    return { deleted: true };
  }

  async getSummary(): Promise<MaterialsSummary> {
    const materials = await this.materialsRepository.findAll();

    const totalMaterials = materials.length;
    const totalStock = materials.reduce(
      (sum, material) => sum + material.currentStock,
      0,
    );

    const healthyCount = materials.filter(
      (material) => material.status === MaterialStatus.Healthy,
    ).length;

    const lowStockCount = materials.filter(
      (material) => material.status === MaterialStatus.LowStock,
    ).length;

    const criticalCount = materials.filter(
      (material) => material.status === MaterialStatus.Critical,
    ).length;

    return {
      totalMaterials,
      totalStock,
      healthyCount,
      lowStockCount,
      criticalCount,
      updatedAt: new Date().toISOString(),
    };
  }

  async stockIn(id: string, dto: StockAdjustmentDto) {
    this.validateStockChange(dto.quantity);

    const material = await this.findOne(id);
    const nextStock = material.currentStock + dto.quantity;

    const updated = await this.applyStockChange(material.id, nextStock);

    await this.stockMovementsService.create({
      materialId: material.id,
      type: StockMovementType.StockIn,
      quantity: dto.quantity,
      source: dto.source,
      note: dto.note,
    });

    return updated;
  }

  async stockOut(id: string, dto: StockAdjustmentDto) {
    this.validateStockChange(dto.quantity);

    const material = await this.findOne(id);
    const nextStock = material.currentStock - dto.quantity;

    if (nextStock < 0) {
      throw new BadRequestException("Stock cannot become negative.");
    }

    const updated = await this.applyStockChange(material.id, nextStock);

    await this.stockMovementsService.create({
      materialId: material.id,
      type: StockMovementType.StockOut,
      quantity: dto.quantity,
      source: dto.source,
      note: dto.note,
    });

    return updated;
  }

  private async applyStockChange(materialId: string, nextStock: number) {
    const material = await this.findOne(materialId);

    const status = getStockStatus(nextStock, material.minStock);

    const updated = await this.materialsRepository.update(materialId, {
      currentStock: nextStock,
      status,
      updatedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Material ${materialId} not found.`);
    }

    await this.alertsService.upsert({
      materialId: updated.id,
      currentStock: updated.currentStock,
      minStock: updated.minStock,
    });

    return updated;
  }

  private validateStockChange(quantity: number) {
    if (quantity === undefined || quantity === null) {
      throw new BadRequestException("Quantity is required.");
    }

    if (Number.isNaN(quantity)) {
      throw new BadRequestException("Quantity must be a number.");
    }

    if (quantity <= 0) {
      throw new BadRequestException("Quantity must be greater than zero.");
    }
  }

  private validateNonNegative(value: number, fieldName: string) {
    if (value === undefined || value === null) {
      throw new BadRequestException(`${fieldName} is required.`);
    }

    if (Number.isNaN(value)) {
      throw new BadRequestException(`${fieldName} must be a number.`);
    }

    if (value < 0) {
      throw new BadRequestException(`${fieldName} must be zero or greater.`);
    }
  }
}
