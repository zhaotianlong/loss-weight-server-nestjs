import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  // Recipes
  @Get('recipes')
  async findAllRecipes(@Query() query: any, @Req() req: any) {
    return this.logisticsService.findAllRecipes(query, req.user);
  }

  @Get('recipes/:id')
  async findOneRecipe(@Param('id') id: string) {
    return this.logisticsService.findOneRecipe(id);
  }

  @Post('recipes')
  async createRecipe(@Body() body: any) {
    return this.logisticsService.createRecipe(body);
  }

  @Put('recipes/:id')
  async updateRecipe(@Param('id') id: string, @Body() body: any) {
    return this.logisticsService.updateRecipe(id, body);
  }

  @Delete('recipes/:id')
  async removeRecipe(@Param('id') id: string) {
    return this.logisticsService.removeRecipe(id);
  }

  // Tuition
  @Get('tuition')
  async findAllTuition(@Query() query: any, @Req() req: any) {
    return this.logisticsService.findAllTuition(query, req.user);
  }

  @Get('tuition/renewal')
  async findAllTuitionRenewal(@Query() query: any) {
    return this.logisticsService.findAllTuitionRenewal(query);
  }

  @Post('tuition/renewal')
  async createTuitionRenewal(@Body() body: any) {
    return this.logisticsService.createTuitionRenewal(body);
  }

  @Get('tuition/:id')
  async findOneTuition(@Param('id') id: string) {
    return this.logisticsService.findOneTuition(Number(id));
  }

  @Post('tuition')
  async createTuition(@Body() body: any) {
    return this.logisticsService.createTuition(body);
  }

  @Put('tuition/:id')
  async updateTuition(@Param('id') id: string, @Body() body: any) {
    return this.logisticsService.updateTuition(Number(id), body);
  }

  @Delete('tuition/:id')
  async removeTuition(@Param('id') id: string) {
    return this.logisticsService.removeTuition(Number(id));
  }

  @Post('tuition/:id/approve')
  async approveTuition(@Param('id') id: string) {
    return this.logisticsService.approveTuition(Number(id));
  }

  @Post('tuition/:id/reject')
  async rejectTuition(@Param('id') id: string) {
    return this.logisticsService.rejectTuition(Number(id));
  }

  // Salary
  @Get('salary/list')
  async findAllSalary(@Query() query: any, @Req() req: any) {
    return this.logisticsService.findAllSalary(query, req.user);
  }

  @Get('salary/strategies')
  async findAllStrategies(@Query() query: any) {
    return this.logisticsService.findAllStrategies(query);
  }

  @Post('salary/strategies')
  async saveStrategy(@Body() body: any) {
    return this.logisticsService.saveStrategy(body);
  }

  @Delete('salary/strategies/:id')
  async removeStrategy(@Param('id') id: string) {
    return this.logisticsService.removeStrategy(Number(id));
  }

  @Post('salary/other')
  async saveSalaryOther(@Body() body: any) {
    return this.logisticsService.saveSalaryOther(body);
  }

  @Delete('salary/:id')
  async removeSalaryRecord(@Param('id') id: string) {
    return this.logisticsService.removeSalaryRecord(Number(id));
  }
}
