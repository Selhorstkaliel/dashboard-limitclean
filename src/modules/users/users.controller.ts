import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Put, 
  Param, 
  Delete, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('ADMIN', 'REPRESENTANTE')
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('nome') nome?: string,
    @Query('email') email?: string,
    @Query('papel') papel?: string,
  ) {
    const filters = { nome, email, papel };
    return this.usersService.findAll(+page, +limit, filters);
  }

  @Get(':id')
  @Roles('ADMIN', 'REPRESENTANTE')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get(':id/sessions')
  @Roles('ADMIN')
  getUserSessions(@Param('id') id: string) {
    return this.usersService.getUserSessions(id);
  }

  @Delete(':id/sessions/:sessionId')
  @Roles('ADMIN')
  revokeUserSession(@Param('id') id: string, @Param('sessionId') sessionId: string) {
    return this.usersService.revokeUserSession(id, sessionId);
  }
}