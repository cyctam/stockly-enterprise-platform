import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { MaterialsService } from "./materials.service";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { UpdateMaterialDto } from "./dto/update-material.dto";
import { StockAdjustmentDto } from "./dto/stock-adjustment.dto";

@Controller("materials")
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  async getMaterials(
    @Query("name") name?: string,
    @Query("category") category?: string,
  ) {
    const materials = await this.materialsService.findAll();

    return materials.filter((material) => {
      const matchesName = name
        ? material.name.toLowerCase().includes(name.toLowerCase())
        : true;
      const matchesCategory = category
        ? material.category.toLowerCase().includes(category.toLowerCase())
        : true;

      return matchesName && matchesCategory;
    });
  }

  @Get("summary")
  getSummary() {
    return this.materialsService.getSummary();
  }

  @Get(":id")
  getMaterial(@Param("id") id: string) {
    return this.materialsService.findOne(id);
  }

  @Post()
  createMaterial(@Body() dto: CreateMaterialDto) {
    return this.materialsService.create(dto);
  }

  @Patch(":id")
  updateMaterial(@Param("id") id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialsService.update(id, dto);
  }

  @Delete(":id")
  deleteMaterial(@Param("id") id: string) {
    return this.materialsService.remove(id);
  }

  @Post(":id/stock-in")
  stockIn(@Param("id") id: string, @Body() dto: StockAdjustmentDto) {
    return this.materialsService.stockIn(id, dto);
  }

  @Post(":id/stock-out")
  stockOut(@Param("id") id: string, @Body() dto: StockAdjustmentDto) {
    return this.materialsService.stockOut(id, dto);
  }
}
