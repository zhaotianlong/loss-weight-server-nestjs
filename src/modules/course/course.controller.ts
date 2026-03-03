import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.courseService.findAll(query);
  }
}

@UseGuards(JwtAuthGuard)
@Controller('private-courses')
export class PrivateCourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findAllPrivate(@Query() query: any) {
    return this.courseService.findAllPrivate(query);
  }
}
