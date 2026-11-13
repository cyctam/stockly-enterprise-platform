import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AlertSeverity } from "../common/enums/alert-severity.enum";

@Entity({ name: "stock_alerts" })
export class StockAlertEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  materialId: string;

  @Column({ type: "int" })
  currentStock: number;

  @Column({ type: "int" })
  minStock: number;

  @Column({ type: "enum", enum: AlertSeverity })
  severity: AlertSeverity;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
