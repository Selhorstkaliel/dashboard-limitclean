import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @Roles('ADMIN', 'REPRESENTANTE', 'VENDEDOR')
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('recent')
  @Roles('ADMIN', 'REPRESENTANTE', 'VENDEDOR')
  getRecentClients(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const filters = { status, search };
    return this.dashboardService.getRecentClients(+page, +limit, filters);
  }

  @Get('charts')
  @Roles('ADMIN', 'REPRESENTANTE', 'VENDEDOR')
  getChartsData() {
    return this.dashboardService.getChartsData();
  }
}