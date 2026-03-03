import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampService } from './camp.service';
import {
  CampController,
  RoomController,
  RoomTypeController,
  BedController,
  FacilityController,
} from './camp.controller';
import { Camp } from './entities/camp.entity';
import { Room } from './entities/room.entity';
import { CampRoomType } from './entities/camp-room-type.entity';
import { Bed } from './entities/bed.entity';
import { Facility } from './entities/facility.entity';
import { Student } from '../student/student.entity';
import { Tuition } from '../logistics/entities/tuition.entity';
import { StudentCheckin } from '../student-health/entities/student-checkin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Camp,
      Room,
      CampRoomType,
      Bed,
      Facility,
      Student,
      Tuition,
      StudentCheckin,
    ]),
  ],
  controllers: [
    CampController,
    RoomController,
    RoomTypeController,
    BedController,
    FacilityController,
  ],
  providers: [CampService],
  exports: [CampService],
})
export class CampModule {}
