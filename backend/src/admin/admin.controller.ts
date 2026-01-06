import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AuthGuard } from "@nestjs/passport";
import { AdminGuard } from "../common/guards/admin.guard";
import { OrderStatus, DisputeResolution } from "@prisma/client";

@Controller("admin")
@UseGuards(AuthGuard("jwt"), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("disputes/:id/force-close")
  forceCloseDispute(
    @Request() req,
    @Param("id") id: string,
    @Body() body: { reason: string; resolution: DisputeResolution },
  ) {
    return this.adminService.forceCloseDispute(
      +id,
      req.user.userId,
      body.reason,
      body.resolution,
    );
  }

  @Patch("orders/:id/override-status")
  overrideOrderStatus(
    @Request() req,
    @Param("id") id: string,
    @Body() body: { status: OrderStatus; reason: string },
  ) {
    return this.adminService.overrideOrderStatus(
      +id,
      body.status,
      req.user.userId,
      body.reason,
    );
  }

  @Post("users/:id/freeze")
  freezeUser(
    @Request() req,
    @Param("id") id: string,
    @Body() body: { reason: string },
  ) {
    return this.adminService.freezeUser(+id, req.user.userId, body.reason);
  }

  @Get("actions")
  getAdminActions(@Request() req) {
    // Optionally filter by current admin
    return this.adminService.getAdminActions();
  }
}
