import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly category: string;

  @IsString()
  @IsNotEmpty()
  readonly unit: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly currentStock?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly minStock: number;
}
