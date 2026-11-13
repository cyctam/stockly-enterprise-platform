import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class StockAdjustmentDto {
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  source?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  note?: string;
}
