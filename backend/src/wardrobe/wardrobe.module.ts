import { Module } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { WardrobeController } from './wardrobe.controller';
import { ItemLifecycleService } from './item-lifecycle.service';
import { RecommendationService } from './recommendation.service';

@Module({
    controllers: [WardrobeController],
    providers: [WardrobeService, ItemLifecycleService, RecommendationService],
    exports: [WardrobeService, ItemLifecycleService, RecommendationService],
})
export class WardrobeModule { }
