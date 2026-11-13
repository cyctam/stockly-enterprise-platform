import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { StockMovementType } from "../common/enums/stock-movement-type.enum";

@Entity({ name: "stock_movements" })
export class StockMovementEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  materialId: string;

  @Column({ type: "enum", enum: StockMovementType })
  type: StockMovementType;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  source?: string;

  @Column({ type: "text", nullable: true })
  note?: string;

  @CreateDateColumn({ type: "timestamptz" })
  timestamp: Date;
}
