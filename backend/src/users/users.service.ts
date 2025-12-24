import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EmailVerificationService } from '../auth/email-verification.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private emailVerification: EmailVerificationService,
    ) { }

    async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: userWhereUniqueInput,
        });
    }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Generate email verification token
        const verificationToken = this.emailVerification.generateVerificationToken();

        const user = await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                emailVerificationToken: verificationToken,
                isEmailVerified: false,
            },
        });

        // Send verification email
        await this.emailVerification.sendVerificationEmail(user.email, verificationToken);

        return user;
    }

    async updateUser(params: {
        where: Prisma.UserWhereUniqueInput;
        data: Prisma.UserUpdateInput;
    }): Promise<User> {
        const { where, data } = params;

        // Hash password if being updated
        if (data.password && typeof data.password === 'string') {
            data.password = await bcrypt.hash(data.password, 10);
        }

        return this.prisma.user.update({
            data,
            where,
        });
    }
}
