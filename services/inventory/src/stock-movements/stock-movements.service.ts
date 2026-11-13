import { Injectable } from "@nestjs/common";
import { StockMovementType } from "../common/enums/stock-movement-type.enum";
import {
  StockMovementsRepository,
  CreateStockMovementParams,
} from "./stock-movements.repository";

export interface StockMovementRecord {
  id: string;
  materialId: string;
  type: StockMovementType;
  quantity: number;
  source?: string;
  note?: string;
  timestamp: string;
}

@Injectable()
export class StockMovementsService {
  constructor(
    private readonly stockMovementsRepository: StockMovementsRepository,
  ) {}

  async findAll(): Promise<StockMovementRecord[]> {
    const records = await this.stockMovementsRepository.findAll();
    return records.map((record) => ({
      id: record.id,
      materialId: record.materialId,
      type: record.type,
      quantity: record.quantity,
      source: record.source,
      note: record.note,
      timestamp: record.timestamp.toISOString(),
    }));
  }

  async create(input: CreateStockMovementParams): Promise<StockMovementRecord> {
    const created = await this.stockMovementsRepository.create(input);
    return {
      id: created.id,
      materialId: created.materialId,
      type: created.type,
      quantity: created.quantity,
      source: created.source,
      note: created.note,
      timestamp: created.timestamp.toISOString(),
    };
  }

  async findByMaterial(materialId: string): Promise<StockMovementRecord[]> {
    const records = await this.stockMovementsRepository.findAll();
    return records
      .filter((record) => record.materialId === materialId)
      .map((record) => ({
        id: record.id,
        materialId: record.materialId,
        type: record.type,
        quantity: record.quantity,
        source: record.source,
        note: record.note,
        timestamp: record.timestamp.toISOString(),
      }));
  }
}
