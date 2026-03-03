import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { StudentModule } from './modules/student/student.module';
import { CampModule } from './modules/camp/camp.module';
import { CourseModule } from './modules/course/course.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { UserModule } from './modules/user/user.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { DutyModule } from './modules/duty/duty.module';
import { CoachModule } from './modules/coach/coach.module';
import { PrivatePurchaseModule } from './modules/private-purchase/private-purchase.module';
import { StudentHealthModule } from './modules/student-health/student-health.module';
import { RedisModule } from './infra/redis.module';
import { SupabaseModule } from './infra/supabase.module';
import { CampGateway } from './sockets/camp.gateway';
import typeOrmConfig from './infra/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),
    RedisModule,
    AuthModule,
    StudentModule,
    CampModule,
    CourseModule,
    LogisticsModule,
    UserModule,
    PerformanceModule,
    DutyModule,
    CoachModule,
    PrivatePurchaseModule,
    StudentHealthModule,
    SupabaseModule,
  ],
  providers: [CampGateway],
})
export class AppModule {}
