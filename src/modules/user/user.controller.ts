import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    return this.userService.findAll(query, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.userService.create(body, req.user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.userService.update(id, body, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post(':id/change-password')
  async changePassword(@Param('id') id: string, @Body() body: any) {
    return this.userService.changePassword(id, body);
  }

  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.userService.resetPassword(id, body, req.user);
  }

  @Post(':id/avatar')
  async uploadAvatar(@Param('id') id: string) {
    return this.userService.uploadAvatar(id);
  }
}
