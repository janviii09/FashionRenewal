import { Module } from '@nestjs/common';
import { WardrobeService } from './wardrobe.service';
import { WardrobeController } from './wardrobe.controller';
import { ItemLifecycleService } from './item-lifecycle.service';

@Module({
    controllers: [WardrobeController],
    providers: [WardrobeService, ItemLifecycleService],
    exports: [WardrobeService, ItemLifecycleService],
})
export class WardrobeModule { }
