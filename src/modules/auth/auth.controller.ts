import { Controller, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, TotpVerifyDto } from './dto/login.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;
    
    return this.authService.login(loginDto, userAgent, ip);
  }

  @Post('2fa/verify')
  async verifyTotp(@Body() body: { tempToken: string } & TotpVerifyDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;
    
    return this.authService.verifyTotp(body.tempToken, body, userAgent, ip);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() refreshTokenDto: RefreshTokenDto, @CurrentUser() user: any) {
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Post('revoke-all-sessions')
  @UseGuards(JwtAuthGuard)
  async revokeAllSessions(@CurrentUser() user: any) {
    await this.authService.revokeAllUserSessions(user.id);
    return { message: 'All sessions revoked successfully' };
  }
}