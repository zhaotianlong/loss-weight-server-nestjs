import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { Recipe } from './entities/recipe.entity';
import { Tuition } from './entities/tuition.entity';
import { Renewal } from './entities/renewal.entity';
import { SalaryRecord } from './entities/salary-record.entity';
import { CommissionStrategy } from './entities/commission-strategy.entity';
import { Student } from '../student/student.entity';
import { Bed } from '../camp/entities/bed.entity';
import { StudentCheckin } from '../student-health/entities/student-checkin.entity';
import { Employee } from '../user/entities/employee.entity';
import { StuPrivateOrder } from '../private-purchase/entities/stu-private-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recipe,
      Tuition,
      Renewal,
      SalaryRecord,
      CommissionStrategy,
      Student,
      Bed,
      StudentCheckin,
      Employee,
      StuPrivateOrder,
    ]),
  ],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}
