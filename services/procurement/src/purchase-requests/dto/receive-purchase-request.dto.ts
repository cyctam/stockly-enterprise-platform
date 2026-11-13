import { IsOptional, IsString } from "class-validator";

export class ReceivePurchaseRequestDto {
  @IsString()
  @IsOptional()
  receivedBy?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
