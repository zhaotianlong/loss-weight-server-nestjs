import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivatePurchaseService } from './private-purchase.service';
import { PrivatePurchaseController } from './private-purchase.controller';
import { StuPrivateOrder } from './entities/stu-private-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StuPrivateOrder]),
  ],
  controllers: [PrivatePurchaseController],
  providers: [PrivatePurchaseService],
  exports: [PrivatePurchaseService],
})
export class PrivatePurchaseModule {}
