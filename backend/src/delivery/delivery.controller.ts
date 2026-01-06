import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { DeliveryService } from "./delivery.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { DeliveryStatus } from "@prisma/client";

@Controller("delivery")
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  /**
   * Get delivery for an order
   * GET /delivery/order/:orderId
   */
  @UseGuards(JwtAuthGuard)
  @Get("order/:orderId")
  async getDelivery(@Param("orderId") orderId: string) {
    return this.deliveryService.getDelivery(parseInt(orderId));
  }

  /**
   * Update delivery status (manual for MVP)
   * POST /delivery/order/:orderId/update-status
   */
  @UseGuards(JwtAuthGuard)
  @Post("order/:orderId/update-status")
  async updateDeliveryStatus(
    @Param("orderId") orderId: string,
    @Body()
    data: {
      status: DeliveryStatus;
      notes?: string;
      trackingNumber?: string;
    },
  ) {
    return this.deliveryService.updateDeliveryStatus(
      parseInt(orderId),
      data.status,
      data.notes,
      data.trackingNumber,
    );
  }
}
