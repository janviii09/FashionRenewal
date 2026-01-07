import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './email-verification.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailVerification: EmailVerificationService,
  ) { }

  @Post('login')
  async login(@Body() req) {
    // Ideally use a LocalAuthGuard here, but simplifying for brevity
    // In a real app, you'd validate credentials here or via a Guard
    const user = await this.authService.validateUser(req.email, req.password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    return this.emailVerification.verifyEmail(body.token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.emailVerification.resendVerificationEmail(body.email);
  }
}
