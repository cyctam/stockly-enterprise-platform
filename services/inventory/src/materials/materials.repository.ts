import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { MaterialStatus } from "../common/enums/material-status.enum";
import { MaterialEntity } from "./material.entity";

export interface CreateMaterialParams {
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  status: MaterialStatus;
}

export interface UpdateMaterialParams {
  name?: string;
  category?: string;
  unit?: string;
  currentStock?: number;
  minStock?: number;
  status?: MaterialStatus;
  updatedAt?: Date;
}

@Injectable()
export class MaterialsRepository {
  constructor(
    @InjectRepository(MaterialEntity)
    private readonly repository: Repository<MaterialEntity>,
  ) {}

  async findAll(): Promise<MaterialEntity[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<MaterialEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<MaterialEntity | null> {
    return this.repository.findOne({
      where: { name: ILike(name.trim()) },
    });
  }

  async create(payload: CreateMaterialParams): Promise<MaterialEntity> {
    const material = this.repository.create(payload);
    return this.repository.save(material);
  }

  async update(
    id: string,
    payload: UpdateMaterialParams,
  ): Promise<MaterialEntity | null> {
    const existing = await this.repository.findOne({ where: { id } });

    if (!existing) {
      return null;
    }

    const updated = this.repository.merge(existing, payload);
    return this.repository.save(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
