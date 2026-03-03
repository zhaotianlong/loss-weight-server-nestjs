import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DutyService } from './duty.service';
import { DutyController } from './duty.controller';
import { Duty } from './entities/duty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Duty]),
  ],
  controllers: [DutyController],
  providers: [DutyService],
  exports: [DutyService],
})
export class DutyModule {}
