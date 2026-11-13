import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export interface PurchaseReceivedEvent {
  requestId: string;
  requestCode: string;
  materialId: string;
  materialName: string;
  quantity: number;
  receivedAt: string;
  source?: string;
  note?: string;
}

@Injectable()
export class PurchaseEventsService {
  private readonly logger = new Logger("PurchaseEventsService");
  private readonly sqsClient: SQSClient | null;
  private readonly queueUrl: string | null;

  constructor(private readonly configService: ConfigService) {
    const queueUrl =
      this.configService.get<string>("PURCHASE_RECEIVED_QUEUE_URL") || null;

    this.queueUrl = queueUrl;
    const region =
      this.configService.get<string>("AWS_REGION") ||
      this.configService.get<string>("AWS_DEFAULT_REGION") ||
      "us-east-1";
    this.sqsClient = queueUrl ? new SQSClient({ region }) : null;

    if (!this.queueUrl) {
      this.logger.warn(
        JSON.stringify({
          msg: "purchase_received_queue_not_configured",
        }),
      );
    }
  }

  async publishPurchaseReceived(
    payload: PurchaseReceivedEvent,
  ): Promise<{ published: boolean; reason?: string }> {
    if (!this.queueUrl || !this.sqsClient) {
      return { published: false, reason: "queue_not_configured" };
    }

    const messageBody = JSON.stringify({
      eventType: "PURCHASE_RECEIVED",
      ...payload,
    });

    try {
      const response = await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: messageBody,
        }),
      );

      this.logger.log(
        JSON.stringify({
          msg: "purchase_received_event_published",
          messageId: response.MessageId,
          requestId: payload.requestId,
          requestCode: payload.requestCode,
          materialId: payload.materialId,
          quantity: payload.quantity,
        }),
      );

      return { published: true };
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          msg: "purchase_received_event_publish_failed",
          requestId: payload.requestId,
          requestCode: payload.requestCode,
          error: (error as Error)?.message,
        }),
      );
      return { published: false, reason: "publish_failed" };
    }
  }
}
