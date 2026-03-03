import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get(':id/private-records')
  async getPrivateRecords(@Param('id') id: string) {
    return this.studentService.getPrivateRecords(Number(id));
  }

  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    return this.studentService.findAll(query, req.user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.studentService.findOne(Number(id));
  }

  @Post()
  async create(@Body() body: any) {
    return this.studentService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.studentService.update(Number(id), body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.studentService.remove(Number(id));
  }

  @Post('apply-renew')
  async applyRenew(@Body() body: any) {
    return this.studentService.applyRenew(body);
  }

  @Get(':id/body-data')
  async findAllBodyData(@Param('id') id: string) {
    return this.studentService.findAllBodyData(Number(id));
  }

  @Post(':id/body-data')
  async createBodyData(@Param('id') id: string, @Body() body: any) {
    return this.studentService.createBodyData(Number(id), body);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('checkin')
export class CheckinController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async findAllCheckin(@Query() query: any) {
    return this.studentService.findAllCheckin(query);
  }
}
