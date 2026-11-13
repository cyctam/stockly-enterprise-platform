import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  getStatus() {
    return {
      status: "ok",
      service: "inventory-service",
      timestamp: new Date().toISOString(),
    };
  }
}
