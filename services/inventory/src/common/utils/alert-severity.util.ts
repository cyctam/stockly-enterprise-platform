import { AlertSeverity } from "../enums/alert-severity.enum";
import { MaterialStatus } from "../enums/material-status.enum";

export function getAlertSeverity(
  currentStock: number,
  minStock: number,
): AlertSeverity {
  if (currentStock <= 0) {
    return AlertSeverity.CRITICAL;
  }

  if (currentStock < minStock) {
    return AlertSeverity.LOW_STOCK;
  }

  return AlertSeverity.HEALTHY;
}

export function mapStatusToSeverity(status: MaterialStatus): AlertSeverity {
  if (status === MaterialStatus.Critical) {
    return AlertSeverity.CRITICAL;
  }

  if (status === MaterialStatus.LowStock) {
    return AlertSeverity.LOW_STOCK;
  }

  return AlertSeverity.HEALTHY;
}
