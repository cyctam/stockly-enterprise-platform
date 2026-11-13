import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { PurchaseRequestsService } from "./purchase-requests.service";
import { CreatePurchaseRequestDto } from "./dto/create-purchase-request.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { ReceivePurchaseRequestDto } from "./dto/receive-purchase-request.dto";
import { RejectPurchaseRequestDto } from "./dto/reject-purchase-request.dto";

@Controller("purchase-requests")
export class PurchaseRequestsController {
  constructor(
    private readonly purchaseRequestsService: PurchaseRequestsService,
  ) {}

  @Get()
  getAll() {
    return this.purchaseRequestsService.findAll();
  }

  @Get("summary")
  getSummary() {
    return this.purchaseRequestsService.getSummary();
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.purchaseRequestsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseRequestDto) {
    return this.purchaseRequestsService.create(dto);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateStatusDto) {
    return this.purchaseRequestsService.updateStatus(id, dto);
  }

  @Patch(":id/approve")
  approve(@Param("id") id: string) {
    return this.purchaseRequestsService.approve(id);
  }

  @Patch(":id/reject")
  reject(@Param("id") id: string, @Body() dto: RejectPurchaseRequestDto) {
    return this.purchaseRequestsService.reject(id, dto.note);
  }

  @Patch(":id/receive")
  receive(@Param("id") id: string, @Body() dto: ReceivePurchaseRequestDto) {
    return this.purchaseRequestsService.receive(id, dto);
  }
}
