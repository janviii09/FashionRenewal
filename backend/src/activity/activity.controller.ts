import { Controller, Post, Get, Body, Request, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('activity')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    /**
     * Track user activity (fire-and-forget)
     * POST /activity/track
     */
    @Post('track')
    @HttpCode(204)
    @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 events per minute
    async trackActivity(
        @Request() req,
        @Body() data: {
            eventType: ActivityType;
            itemId?: number;
            category?: string;
            metadata?: Record<string, any>;
        }
    ) {
        const userId = req.user?.userId || null;
        const sessionId = req.sessionID || req.headers['x-session-id'] || null;

        // Fire and forget
        this.activityService.trackActivity(userId, sessionId, data);

        // Return immediately (no content)
        return;
    }

    /**
     * Get user's activity history
     * GET /activity/history
     */
    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getActivityHistory(
        @Request() req,
        @Query('limit') limit?: string
    ) {
        const userId = req.user.userId;
        const limitNum = limit ? parseInt(limit, 10) : 50;

        const activities = await this.activityService.getUserActivities(
            userId,
            limitNum
        );

        return {
            activities,
            meta: {
                userId,
                count: activities.length
            }
        };
    }

    /**
     * Get recently viewed items
     * GET /activity/recently-viewed
     */
    @Get('recently-viewed')
    async getRecentlyViewed(
        @Request() req,
        @Query('limit') limit?: string
    ) {
        const userId = req.user?.userId || null;
        const sessionId = req.sessionID || req.headers['x-session-id'] || null;
        const limitNum = limit ? parseInt(limit, 10) : 12;

        const items = await this.activityService.getRecentlyViewed(
            userId,
            sessionId,
            limitNum
        );

        return {
            items: items.map(rv => rv.item),
            meta: {
                count: items.length,
                lastViewed: items[0]?.viewedAt
            }
        };
    }
}
