import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('coach_monthly_performance')
export class CoachMonthlyPerformance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coach_id' })
  coachId: string;

  @Column()
  month: string;

  @Column()
  count: number;
}
