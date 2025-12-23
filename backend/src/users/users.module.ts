import { Module } from '@nestjs/common';
import { UtilService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    controllers: [UsersController],
    providers: [UtilService],
    exports: [UtilService],
})
export class UsersModule { }
