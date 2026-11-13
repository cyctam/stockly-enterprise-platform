import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { MaterialsService } from "../materials/materials.service";
import { StockAdjustmentDto } from "../materials/dto/stock-adjustment.dto";

export type StockEventType = "STOCK_IN" | "STOCK_OUT";

export interface StockEventPayload {
  materialId: string;
  type: StockEventType;
  quantity: number;
  source?: string;
  note?: string;
  receivedAt?: string;
}

@Injectable()
export class StockEventsService {
  private readonly logger = new Logger("StockEventsService");

  constructor(private readonly materialsService: MaterialsService) {}

  async handleStockEvent(event: StockEventPayload) {
    this.validateEvent(event);

    const adjustment: StockAdjustmentDto = {
      quantity: event.quantity,
      source: event.source,
      note: event.note,
    };

    this.logger.log(
      JSON.stringify({
        msg: "stock_event_received",
        materialId: event.materialId,
        type: event.type,
        quantity: event.quantity,
        source: event.source,
        note: event.note,
        receivedAt: event.receivedAt,
      }),
    );

    if (event.type === "STOCK_IN") {
      return this.materialsService.stockIn(event.materialId, adjustment);
    }

    return this.materialsService.stockOut(event.materialId, adjustment);
  }

  private validateEvent(event: StockEventPayload) {
    if (!event || !event.materialId) {
      throw new BadRequestException("materialId is required.");
    }

    if (event.type !== "STOCK_IN" && event.type !== "STOCK_OUT") {
      throw new BadRequestException("type must be STOCK_IN or STOCK_OUT.");
    }

    if (event.quantity === undefined || event.quantity === null) {
      throw new BadRequestException("quantity is required.");
    }

    if (Number.isNaN(event.quantity) || event.quantity <= 0) {
      throw new BadRequestException("quantity must be greater than zero.");
    }
  }
}
