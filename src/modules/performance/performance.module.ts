import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import { PerformanceGoal } from './entities/performance-goal.entity';
import { Tuition } from '../logistics/entities/tuition.entity';
import { StuPrivateOrder } from '../private-purchase/entities/stu-private-order.entity';
import { Student } from '../student/student.entity';
import { Camp } from '../camp/entities/camp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PerformanceGoal,
      Tuition,
      StuPrivateOrder,
      Student,
      Camp,
    ]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
