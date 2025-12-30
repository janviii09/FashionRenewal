import { Module } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { WardrobeController } from './wardrobe.controller';
import { ItemLifecycleService } from './item-lifecycle.service';
import { RecommendationService } from './recommendation.service';
import { BrowseService } from './browse.service';
import { DiscoverService } from './discover.service';
import { AffinityModule } from '../affinity/affinity.module';

@Module({
    imports: [AffinityModule],
    controllers: [WardrobeController],
    providers: [
        WardrobeService,
        ItemLifecycleService,
        RecommendationService,
        BrowseService,
        DiscoverService
    ],
    exports: [WardrobeService, ItemLifecycleService, RecommendationService],
})
export class WardrobeModule { }
