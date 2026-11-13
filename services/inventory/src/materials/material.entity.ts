import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MaterialStatus } from "../common/enums/material-status.enum";

@Entity({ name: "materials" })
export class MaterialEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 120 })
  name: string;

  @Column({ type: "varchar", length: 80 })
  category: string;

  @Column({ type: "varchar", length: 40 })
  unit: string;

  @Column({ type: "int", default: 0 })
  currentStock: number;

  @Column({ type: "int", default: 0 })
  minStock: number;

  @Column({ type: "varchar", length: 20 })
  status: MaterialStatus;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  constructor(partial?: Partial<MaterialEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
