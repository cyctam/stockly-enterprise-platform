import { Controller, Get, Injectable, Module } from "@nestjs/common";

@Injectable()
class HealthService {
  getStatus() {
    return {
      status: "ok",
      service: "procurement-service",
      timestamp: new Date().toISOString(),
    };
  }
}

@Controller("health")
class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check() {
    return this.healthService.getStatus();
  }
}

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
