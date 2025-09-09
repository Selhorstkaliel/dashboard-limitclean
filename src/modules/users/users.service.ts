import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { cpfCnpj: createUserDto.cpfCnpj },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or CPF/CNPJ already exists');
    }

    // Hash password
    const senhaHash = await argon2.hash(createUserDto.password);

    const { password, ...userData } = createUserDto;
    
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        senhaHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpfCnpj: true,
        papel: true,
        twofaEnabled: true,
        avatarPath: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll(page: number = 1, limit: number = 10, filters?: any) {
    const skip = (page - 1) * limit;
    
    const where = {};
    if (filters?.nome) {
      where['nome'] = { contains: filters.nome, mode: 'insensitive' };
    }
    if (filters?.email) {
      where['email'] = { contains: filters.email, mode: 'insensitive' };
    }
    if (filters?.papel) {
      where['papel'] = filters.papel;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nome: true,
          email: true,
          cpfCnpj: true,
          papel: true,
          twofaEnabled: true,
          avatarPath: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        cpfCnpj: true,
        papel: true,
        twofaEnabled: true,
        avatarPath: true,
        preferenciasJson: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id); // This will throw if user doesn't exist

    const updateData: any = { ...updateUserDto };
    
    // Hash password if provided
    if (updateUserDto.password) {
      updateData.senhaHash = await argon2.hash(updateUserDto.password);
      delete updateData.password;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        cpfCnpj: true,
        papel: true,
        twofaEnabled: true,
        avatarPath: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string) {
    await this.findOne(id); // This will throw if user doesn't exist
    
    await this.prisma.user.delete({
      where: { id },
    });
    
    return { message: 'User deleted successfully' };
  }

  async getUserSessions(userId: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async revokeUserSession(userId: string, sessionId: string) {
    await this.prisma.userSession.update({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Session revoked successfully' };
  }
}