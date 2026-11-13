import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CreatePurchaseRequestDto {
  @IsString()
  @IsNotEmpty()
  materialId!: string;

  @IsString()
  @IsOptional()
  materialName?: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsNotEmpty()
  requestedBy!: string;
}
