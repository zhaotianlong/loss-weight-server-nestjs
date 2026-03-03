import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('goals')
  async findAllGoals(@Query() query: any, @Req() req: any) {
    return this.performanceService.findAllGoals(query, req.user);
  }

  @Post('goals')
  async createGoal(@Body() body: any) {
    return this.performanceService.createGoal(body);
  }

  @Put('goals/:id')
  async updateGoal(@Param('id') id: string, @Body() body: any) {
    return this.performanceService.updateGoal(Number(id), body);
  }

  @Delete('goals/:id')
  async removeGoal(@Param('id') id: string) {
    return this.performanceService.removeGoal(Number(id));
  }

  @Get('stats')
  async getStats(@Query() query: any, @Req() req: any) {
    return this.performanceService.getStats(query, req.user);
  }
}
