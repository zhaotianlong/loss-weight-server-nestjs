import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { StudentHealthService } from './student-health.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class StudentHealthController {
  constructor(private readonly healthService: StudentHealthService) {}

  // Body Data
  @Get('stu-body-data')
  async findAllBodyData(@Query() query: any) {
    return this.healthService.findAllBodyData(query);
  }

  @Get('stu-body-data/:id')
  async findOneBodyData(@Param('id') id: string) {
    return this.healthService.findOneBodyData(Number(id));
  }

  @Post('stu-body-data')
  async createBodyData(@Body() body: any) {
    return this.healthService.createBodyData(body);
  }

  @Put('stu-body-data/:id')
  async updateBodyData(@Param('id') id: string, @Body() body: any) {
    return this.healthService.updateBodyData(Number(id), body);
  }

  @Delete('stu-body-data/:id')
  async removeBodyData(@Param('id') id: string) {
    return this.healthService.removeBodyData(Number(id));
  }

  // Checkins
  @Get('checkins')
  async findAllCheckins(@Query() query: any) {
    return this.healthService.findAllCheckins(query);
  }

  @Get('checkins/:id')
  async findOneCheckin(@Param('id') id: string) {
    return this.healthService.findOneCheckin(Number(id));
  }

  @Post('checkins')
  async createCheckin(@Body() body: any) {
    return this.healthService.createCheckin(body);
  }

  @Put('checkins/:id')
  async updateCheckin(@Param('id') id: string, @Body() body: any) {
    return this.healthService.updateCheckin(Number(id), body);
  }

  @Delete('checkins/:id')
  async removeCheckin(@Param('id') id: string) {
    return this.healthService.removeCheckin(Number(id));
  }
}
