import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('performance_goals')
export class PerformanceGoal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column({ name: 'coach_id' })
  coachId: string;

  @Column({ name: 'coach_name' })
  coachName: string;

  @Column()
  month: string; // YYYY-MM

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'recruitment_goal' })
  recruitmentGoal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'private_coaching_goal' })
  privateCoachingGoal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'renewal_goal' })
  renewalGoal: number;

  @Column({ name: 'renewal_type' })
  renewalType: string; // 'amount', 'percentage'

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
