import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { CourseController, PrivateCourseController } from './course.controller';
import { Course } from './entities/course.entity';
import { PrivateCourse } from './entities/private-course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, PrivateCourse]),
  ],
  controllers: [CourseController, PrivateCourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
