import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { StockEventsService } from "./stock-events.service";

interface SqsRecord {
  body?: string;
  messageId?: string;
  attributes?: Record<string, string>;
}

interface SqsEventPayload {
  Records?: SqsRecord[];
}

interface StockInflowPayload {
  materialId?: string;
  materialName?: string;
  quantity?: number;
  source?: string;
  note?: string;
  timestamp?: string;
}

@Controller("stock-events")
export class StockEventsController {
  constructor(private readonly stockEventsService: StockEventsService) {}

  @Post("sqs-inflow")
  async handleSqsInflow(@Body() body: SqsEventPayload) {
    if (!body || !Array.isArray(body.Records)) {
      throw new BadRequestException("Invalid SQS payload: Records missing.");
    }

    const results = [];

    for (const record of body.Records) {
      if (!record.body) {
        throw new BadRequestException(
          "Invalid SQS payload: record body missing.",
        );
      }

      let parsed: StockInflowPayload | StockInflowPayload[];
      try {
        parsed = JSON.parse(record.body);
      } catch (error) {
        throw new BadRequestException("Invalid SQS payload: body is not JSON.");
      }

      const payloads = Array.isArray(parsed) ? parsed : [parsed];

      for (const payload of payloads) {
        if (!payload.materialId) {
          throw new BadRequestException("materialId is required.");
        }

        const quantity = Number(payload.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new BadRequestException("quantity must be a positive number.");
        }

        const processed = await this.stockEventsService.handleStockEvent({
          materialId: payload.materialId,
          type: "STOCK_IN",
          quantity,
          source: payload.source,
          note: payload.note,
          receivedAt: payload.timestamp,
        });

        results.push({
          messageId: record.messageId,
          materialId: payload.materialId,
          processed,
        });
      }
    }

    return {
      received: body.Records.length,
      processed: results.length,
      results,
    };
  }
}
