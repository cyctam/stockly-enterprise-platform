import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StockMovementType } from "../common/enums/stock-movement-type.enum";
import { StockMovementEntity } from "./stock-movement.entity";

export interface CreateStockMovementParams {
  materialId: string;
  type: StockMovementType;
  quantity: number;
  source?: string;
  note?: string;
}

@Injectable()
export class StockMovementsRepository {
  constructor(
    @InjectRepository(StockMovementEntity)
    private readonly repository: Repository<StockMovementEntity>,
  ) {}

  async findAll(): Promise<StockMovementEntity[]> {
    return this.repository.find({
      order: {
        timestamp: "DESC",
      },
    });
  }

  async create(
    payload: CreateStockMovementParams,
  ): Promise<StockMovementEntity> {
    const movement = this.repository.create({
      materialId: payload.materialId,
      type: payload.type,
      quantity: payload.quantity,
      source: payload.source,
      note: payload.note,
    });

    return this.repository.save(movement);
  }
}
