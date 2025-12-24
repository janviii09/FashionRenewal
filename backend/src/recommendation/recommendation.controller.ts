import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationController {
    constructor(private readonly recService: RecommendationService) { }

    @Get()
    async getRecommendations(@Request() req) {
        return this.recService.getRecommendations(req.user.id);
    }
}
