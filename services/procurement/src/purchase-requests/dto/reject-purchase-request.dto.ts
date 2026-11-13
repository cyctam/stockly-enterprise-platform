import { IsOptional, IsString } from "class-validator";

export class RejectPurchaseRequestDto {
  @IsString()
  @IsOptional()
  rejectedBy?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
