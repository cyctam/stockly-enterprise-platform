import { MaterialStatus } from '../enums/material-status.enum';

export function getStockStatus(
  currentStock: number,
  minStock: number,
): MaterialStatus {
  if (currentStock <= 0) {
    return MaterialStatus.Critical;
  }

  if (currentStock < minStock) {
    return MaterialStatus.LowStock;
  }

  return MaterialStatus.Healthy;
}

export function isLowStock(currentStock: number, minStock: number): boolean {
  return currentStock < minStock;
}

export function isCriticalStock(currentStock: number): boolean {
  return currentStock <= 0;
}
