import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { DutyService } from './duty.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('duties')
export class DutyController {
  constructor(private readonly dutyService: DutyService) {}

  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    return this.dutyService.findAll(query, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.dutyService.findOne(Number(id));
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.dutyService.create(body, req.user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.dutyService.update(Number(id), body, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.dutyService.remove(Number(id), req.user);
  }

  @Post('batch-recipes')
  async batchRecipes(@Body() body: any) {
    return this.dutyService.batchRecipes(body);
  }

  @Post('batch-schedules')
  async batchSchedules(@Body() body: any) {
    return this.dutyService.batchSchedules(body);
  }
}
