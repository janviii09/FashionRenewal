import { Module } from "@nestjs/common";
import { MarketplaceService } from "./marketplace.service";
import { MarketplaceController } from "./marketplace.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditModule } from "../audit/audit.module";
import { OrderStateMachineService } from "./order-state-machine.service";
import { SubscriptionModule } from "../subscription/subscription.module";

@Module({
  imports: [PrismaModule, AuditModule, SubscriptionModule],
  providers: [MarketplaceService, OrderStateMachineService],
  controllers: [MarketplaceController],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
