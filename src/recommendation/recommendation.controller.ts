import { Controller, Post, UseGuards } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
// import { AuthGuard } from '@nestjs/passport'; // Recommendations might be system admin triggered

@Controller('recommendations')
export class RecommendationController {
    constructor(private readonly recService: RecommendationService) { }

    @Post('trigger')
    trigger() {
        return this.recService.generateRecommendations();
    }
}
