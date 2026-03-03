import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentHealthService } from './student-health.service';
import { StudentHealthController } from './student-health.controller';
import { StuBodyData } from './entities/stu-body-data.entity';
import { StudentCheckin } from './entities/student-checkin.entity';
import { Student } from '../student/student.entity';
import { Bed } from '../camp/entities/bed.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StuBodyData,
      StudentCheckin,
      Student,
      Bed,
    ]),
  ],
  controllers: [StudentHealthController],
  providers: [StudentHealthService],
  exports: [StudentHealthService],
})
export class StudentHealthModule {}
