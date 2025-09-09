import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import { CryptoService } from '../../infra/crypto/crypto.service';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import { LoginDto, TotpVerifyDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user && await argon2.verify(user.senhaHash, password)) {
        const { senhaHash, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto, userAgent?: string, ip?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.twofaEnabled) {
      // Store temporary login state in Redis
      const tempKey = `temp_login:${user.id}`;
      await this.redisService.setWithExpire(tempKey, JSON.stringify({ userAgent, ip }), 300); // 5 minutes
      
      return {
        requires2FA: true,
        tempToken: user.id, // Send user ID as temp token
      };
    }

    return this.generateTokens(user, userAgent, ip);
  }

  async verifyTotp(userId: string, totpVerifyDto: TotpVerifyDto, userAgent?: string, ip?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twofaEnabled || !user.totpSecret) {
      throw new BadRequestException('2FA not enabled for this user');
    }

    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpVerifyDto.token,
      window: 1,
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid TOTP token');
    }

    // Remove temporary login state
    await this.redisService.del(`temp_login:${userId}`);

    return this.generateTokens(user, userAgent, ip);
  }

  private async generateTokens(user: any, userAgent?: string, ip?: string) {
    const payload = {
      email: user.email,
      sub: user.id,
      papel: user.papel,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('security.jwtSecret'),
      expiresIn: this.configService.get('security.tokenExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('security.jwtRefreshSecret'),
      expiresIn: this.configService.get('security.refreshExpiresIn'),
    });

    // Store refresh token hash in Redis with expiration
    const refreshTokenHash = this.cryptoService.hash(refreshToken);
    const refreshExpiry = this.parseExpiration(this.configService.get('security.refreshExpiresIn'));
    await this.redisService.setWithExpire(`refresh_token:${refreshTokenHash}`, user.id, refreshExpiry);

    // Create user session
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        userAgent,
        ip,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        papel: user.papel,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('security.jwtRefreshSecret'),
      });

      const refreshTokenHash = this.cryptoService.hash(refreshToken);
      const userId = await this.redisService.get(`refresh_token:${refreshTokenHash}`);

      if (!userId || userId !== payload.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Remove old refresh token
      await this.redisService.del(`refresh_token:${refreshTokenHash}`);

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    if (refreshToken) {
      const refreshTokenHash = this.cryptoService.hash(refreshToken);
      await this.redisService.del(`refresh_token:${refreshTokenHash}`);
    }
  }

  async revokeAllUserSessions(userId: string) {
    // Mark all sessions as revoked
    await this.prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    // Remove all refresh tokens from Redis (this is a simplified approach)
    // In production, you might want to maintain a user-to-tokens mapping
  }

  private parseExpiration(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // default 1 hour

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600;
    }
  }
}