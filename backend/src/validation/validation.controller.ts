import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ValidationService } from "./validation.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("validations")
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  /**
   * Get pending validations (validator only)
   * GET /validations/pending
   */
  @UseGuards(JwtAuthGuard)
  @Get("pending")
  async getPendingValidations(@Request() req) {
    return this.validationService.getPendingValidations(req.user.userId);
  }

  /**
   * Approve a validation (validator only)
   * POST /validations/:id/approve
   */
  @UseGuards(JwtAuthGuard)
  @Post(":id/approve")
  async approveValidation(
    @Request() req,
    @Param("id") id: string,
    @Body() data: { notes?: string },
  ) {
    return this.validationService.approveValidation(
      parseInt(id),
      req.user.userId,
      data.notes,
    );
  }

  /**
   * Reject a validation (validator only)
   * POST /validations/:id/reject
   */
  @UseGuards(JwtAuthGuard)
  @Post(":id/reject")
  async rejectValidation(
    @Request() req,
    @Param("id") id: string,
    @Body() data: { notes: string },
  ) {
    return this.validationService.rejectValidation(
      parseInt(id),
      req.user.userId,
      data.notes,
    );
  }

  /**
   * Get validation for an order
   * GET /validations/order/:orderId
   */
  @UseGuards(JwtAuthGuard)
  @Get("order/:orderId")
  async getOrderValidation(@Param("orderId") orderId: string) {
    return this.validationService.getOrderValidation(parseInt(orderId));
  }
}
