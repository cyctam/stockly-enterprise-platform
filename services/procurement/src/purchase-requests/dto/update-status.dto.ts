import { IsEnum, IsOptional, IsString } from "class-validator";
import { PurchaseRequestStatus } from "../../common/enums/purchase-request-status.enum";

export class UpdateStatusDto {
  @IsEnum(PurchaseRequestStatus)
  status!: PurchaseRequestStatus;

  @IsString()
  @IsOptional()
  note?: string;
}
