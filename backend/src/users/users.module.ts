import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailVerificationService } from '../auth/email-verification.service';

@Module({
    imports: [PrismaModule],
    providers: [UsersService, EmailVerificationService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule { }
