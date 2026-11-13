import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AlertSeverity } from "../common/enums/alert-severity.enum";
import { StockAlertEntity } from "./stock-alert.entity";

export interface UpsertAlertParams {
  materialId: string;
  currentStock: number;
  minStock: number;
  severity: AlertSeverity;
}

@Injectable()
export class AlertsRepository {
  constructor(
    @InjectRepository(StockAlertEntity)
    private readonly alertsRepository: Repository<StockAlertEntity>,
  ) {}

  async findAll(): Promise<StockAlertEntity[]> {
    return this.alertsRepository.find({ order: { createdAt: "DESC" } });
  }

  async findByMaterialId(materialId: string): Promise<StockAlertEntity | null> {
    return this.alertsRepository.findOne({ where: { materialId } });
  }

  async upsertLowStock(payload: UpsertAlertParams): Promise<StockAlertEntity> {
    const existing = await this.findByMaterialId(payload.materialId);

    if (existing) {
      existing.currentStock = payload.currentStock;
      existing.minStock = payload.minStock;
      existing.severity = payload.severity;
      return this.alertsRepository.save(existing);
    }

    const created = this.alertsRepository.create({
      materialId: payload.materialId,
      currentStock: payload.currentStock,
      minStock: payload.minStock,
      severity: payload.severity,
    });

    return this.alertsRepository.save(created);
  }

  async deleteByMaterialId(materialId: string): Promise<boolean> {
    const result = await this.alertsRepository.delete({ materialId });
    return (result.affected ?? 0) > 0;
  }
}
