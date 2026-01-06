import { Module } from "@nestjs/common";
import { WearTrackerService } from "./wear-tracker.service";
import { WearTrackerController } from "./wear-tracker.controller";

@Module({
  controllers: [WearTrackerController],
  providers: [WearTrackerService],
  exports: [WearTrackerService],
})
export class WearTrackerModule {}
