import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PrivatePurchaseService } from './private-purchase.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('private-purchases')
export class PrivatePurchaseController {
  constructor(private readonly privatePurchaseService: PrivatePurchaseService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.privatePurchaseService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.privatePurchaseService.findOne(Number(id));
  }

  @Post()
  async create(@Body() body: any) {
    return this.privatePurchaseService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.privatePurchaseService.update(Number(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.privatePurchaseService.remove(Number(id));
  }
}
