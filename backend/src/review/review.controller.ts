import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * Create a review for an order
   * POST /reviews/order/:orderId
   */
  @UseGuards(JwtAuthGuard)
  @Post("order/:orderId")
  async createReview(
    @Request() req,
    @Param("orderId") orderId: string,
    @Body() data: { rating: number; comment?: string },
  ) {
    return this.reviewService.createReview(
      req.user.userId,
      parseInt(orderId),
      data,
    );
  }

  /**
   * Get reviews for a user (public)
   * GET /reviews/user/:userId
   */
  @Get("user/:userId")
  async getUserReviews(@Param("userId") userId: string) {
    return this.reviewService.getUserReviews(parseInt(userId));
  }

  /**
   * Get review statistics for a user (public)
   * GET /reviews/user/:userId/stats
   */
  @Get("user/:userId/stats")
  async getUserReviewStats(@Param("userId") userId: string) {
    return this.reviewService.getUserReviewStats(parseInt(userId));
  }

  // NO UPDATE ENDPOINT - reviews are IMMUTABLE
  // NO DELETE ENDPOINT - reviews are PERMANENT
}
