import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UtilService } from './users.service';
import { User as UserModel } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UtilService) { }

    @Get(':id')
    async getUser(@Param('id') id: string): Promise<UserModel> {
        return this.userService.user({ id: Number(id) });
    }

    @Post()
    async signupUser(
        @Body() userData: { name?: string; email: string; password?: string },
    ): Promise<UserModel> {
        return this.userService.createUser({
            email: userData.email,
            password: userData.password || 'temp-password', // Placeholder for hashing
            name: userData.name,
        });
    }
}
