import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { Employee } from '../user/entities/employee.entity';
import { Student } from '../student/student.entity';
import { CoachStudentRelation } from './entities/coach-student-relation.entity';
import { StuClassRecord } from '../private-purchase/entities/stu-class-record.entity';
import { StuPrivateOrder } from '../private-purchase/entities/stu-private-order.entity';
import { Course } from '../course/entities/course.entity';
import { Tuition } from '../logistics/entities/tuition.entity';
import { PerformanceStat } from '../performance/entities/performance-stat.entity';
import { CoachMonthlyPerformance } from '../performance/entities/coach-monthly-performance.entity';
import { PerformanceRanking } from '../performance/entities/performance-ranking.entity';
import { PrivateCourse } from '../course/entities/private-course.entity';
import { Duty } from '../duty/entities/duty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Student,
      CoachStudentRelation,
      StuClassRecord,
      StuPrivateOrder,
      Course,
      Tuition,
      PerformanceStat,
      CoachMonthlyPerformance,
      PerformanceRanking,
      PrivateCourse,
      Duty,
    ]),
  ],
  controllers: [CoachController],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
