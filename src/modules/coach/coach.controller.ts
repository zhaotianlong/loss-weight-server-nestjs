import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CoachService } from './coach.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('coaches')
  async findAll(@Query() query: any) {
    return this.coachService.findAll(query);
  }

  @Get('coach/responsible-students/:coachId')
  async findResponsibleStudents(@Param('coachId') coachId: string) {
    return this.coachService.findResponsibleStudents(coachId);
  }

  @Get('coach/courses/private/:coachId')
  async findPrivateCourses(@Param('coachId') coachId: string) {
    return this.coachService.findPrivateCourses(coachId);
  }

  @Get('coach/courses/public/:coachId')
  async findPublicCourses(@Param('coachId') coachId: string) {
    return this.coachService.findPublicCourses(coachId);
  }

  @Get('coach/performance/:type/:coachId')
  async getPerformance(@Param('type') type: string, @Param('coachId') coachId: string) {
    return this.coachService.getPerformance(type, coachId);
  }

  @Post('coach/private-orders')
  async createPrivateOrder(@Body() body: any) {
    return this.coachService.createPrivateOrder(body);
  }

  @Post('coach/class-records')
  async recordClass(@Body() body: any) {
    return this.coachService.recordClass(body);
  }

  @Get('coach/performance/:coachId/overview')
  async getPerformanceOverview(@Param('coachId') coachId: string) {
    return this.coachService.getPerformanceOverview(coachId);
  }

  @Post('coach/room-inspection')
  async roomInspection(@Body() body: any) {
    return this.coachService.roomInspection(body);
  }

  @Get('coach/student-list')
  async getStudentList(@Query() query: any) {
    return this.coachService.getStudentList(query);
  }

  @Get('coach/list')
  async getCoachList(@Query('campId') campId?: string) {
    return this.coachService.getCoachList(campId ? Number(campId) : undefined);
  }

  @Post('coach/assign')
  async assignCoach(@Body() body: any) {
    return this.coachService.assignCoach(body);
  }
}
