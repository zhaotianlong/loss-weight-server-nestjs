import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentController, CheckinController } from './student.controller';
import { StudentService } from './student.service';
import { Student } from './student.entity';
import { Bed } from '../camp/entities/bed.entity';
import { StudentCheckin } from '../student-health/entities/student-checkin.entity';
import { StuBodyData } from '../student-health/entities/stu-body-data.entity';
import { Tuition } from '../logistics/entities/tuition.entity';
import { CoachStudentRelation } from '../coach/entities/coach-student-relation.entity';
import { StuClassRecord } from '../private-purchase/entities/stu-class-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Bed,
      StudentCheckin,
      StuBodyData,
      Tuition,
      CoachStudentRelation,
      StuClassRecord,
    ]),
  ],
  controllers: [StudentController, CheckinController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
