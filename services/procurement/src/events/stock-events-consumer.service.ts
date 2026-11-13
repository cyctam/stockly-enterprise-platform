import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

export interface StockEventPayload {
  eventType: string;
  materialId?: string;
  quantity?: number;
  source?: string;
  note?: string;
  receivedAt?: string;
  [key: string]: unknown;
}

@Injectable()
export class StockEventsConsumerService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger("StockEventsConsumerService");
  private readonly sqsClient: SQSClient | null;
  private readonly queueUrl: string | null;
  private readonly pollIntervalMs: number;
  private readonly waitTimeSeconds: number;
  private readonly enabled: boolean;
  private running = false;
  private pollTimer: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {
    const queueUrl =
      this.configService.get<string>("STOCK_EVENTS_QUEUE_URL") || null;
    this.queueUrl = queueUrl;
    this.pollIntervalMs = Number(
      this.configService.get<string>("STOCK_EVENTS_POLL_INTERVAL_MS") || 5000,
    );
    this.waitTimeSeconds = Number(
      this.configService.get<string>("STOCK_EVENTS_WAIT_TIME_SECONDS") || 10,
    );

    this.enabled =
      (this.configService.get<string>("STOCK_EVENTS_CONSUMER_ENABLED") ||
        "true") === "true";

    const region =
      this.configService.get<string>("AWS_REGION") ||
      this.configService.get<string>("AWS_DEFAULT_REGION") ||
      "us-east-1";
    this.sqsClient = queueUrl ? new SQSClient({ region }) : null;

    if (!this.queueUrl) {
      this.logger.warn(
        JSON.stringify({
          msg: "stock_events_queue_not_configured",
        }),
      );
    }

    if (!this.enabled) {
      this.logger.warn(
        JSON.stringify({
          msg: "stock_events_consumer_disabled",
        }),
      );
    }
  }

  onModuleInit() {
    if (!this.enabled || !this.queueUrl || !this.sqsClient) {
      return;
    }
    this.running = true;
    this.schedulePoll(0);
  }

  onModuleDestroy() {
    this.running = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private schedulePoll(delayMs: number) {
    if (!this.running) {
      return;
    }

    this.pollTimer = setTimeout(() => {
      this.poll().catch((error) => {
        this.logger.error(
          JSON.stringify({
            msg: "stock_events_poll_failed",
            error: (error as Error)?.message,
          }),
        );
        this.schedulePoll(this.pollIntervalMs);
      });
    }, delayMs);
  }

  private async poll() {
    if (!this.queueUrl || !this.sqsClient || !this.running) {
      return;
    }

    const response = await this.sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: this.waitTimeSeconds,
        VisibilityTimeout: 30,
      }),
    );

    const messages = response.Messages ?? [];

    if (!messages.length) {
      this.schedulePoll(this.pollIntervalMs);
      return;
    }

    for (const message of messages) {
      const receiptHandle = message.ReceiptHandle;
      const body = message.Body;

      if (!receiptHandle) {
        continue;
      }

      try {
        const parsed = body ? JSON.parse(body) : {};
        await this.handleStockEvent(parsed as StockEventPayload);

        await this.sqsClient.send(
          new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: receiptHandle,
          }),
        );
      } catch (error) {
        this.logger.error(
          JSON.stringify({
            msg: "stock_event_processing_failed",
            error: (error as Error)?.message,
            messageId: message.MessageId,
          }),
        );
      }
    }

    this.schedulePoll(0);
  }

  private async handleStockEvent(event: StockEventPayload) {
    this.logger.log(
      JSON.stringify({
        msg: "stock_event_received",
        eventType: event.eventType,
        materialId: event.materialId,
        quantity: event.quantity,
        source: event.source,
        note: event.note,
        receivedAt: event.receivedAt,
      }),
    );

    // Placeholder: implement integration if procurement needs to react to stock events.
  }
}
