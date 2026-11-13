import { Controller, Get, Query } from "@nestjs/common";
import { StockMovementsService } from "./stock-movements.service";
import { StockMovementType } from "../common/enums/stock-movement-type.enum";

@Controller("stock-movements")
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  async getStockMovements(
    @Query("materialId") materialId?: string,
    @Query("type") type?: StockMovementType,
  ) {
    const movements = materialId
      ? await this.stockMovementsService.findByMaterial(materialId)
      : await this.stockMovementsService.findAll();

    if (!type) {
      return movements;
    }

    return movements.filter((movement) => movement.type === type);
  }
}
