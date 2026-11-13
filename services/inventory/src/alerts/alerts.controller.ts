import { Controller, Get } from "@nestjs/common";
import { AlertsService } from "./alerts.service";

@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  getAlerts() {
    return this.alertsService.findAll();
  }

  @Get("low-stock")
  getLowStockAlerts() {
    return this.alertsService.findLowStock();
  }
}
