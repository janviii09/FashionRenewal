import { Controller, Post, Param, Get, UseGuards } from "@nestjs/common";
import { WearTrackerService } from "./wear-tracker.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("wear-tracker")
@UseGuards(AuthGuard("jwt"))
export class WearTrackerController {
  constructor(private readonly wearService: WearTrackerService) {}

  @Post(":itemId/log")
  logWear(@Param("itemId") itemId: string) {
    return this.wearService.logWear(+itemId);
  }

  @Get(":itemId/stats")
  getStats(@Param("itemId") itemId: string) {
    return this.wearService.getWearFrequency(+itemId);
  }
}
