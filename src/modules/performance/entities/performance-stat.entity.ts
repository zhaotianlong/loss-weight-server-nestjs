import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('performance_stats')
export class PerformanceStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coach_id' })
  coachId: string;

  @Column({ name: 'courses_to_complete' })
  coursesToComplete: number;

  @Column({ name: 'courses_sold' })
  coursesSold: number;

  @Column({ type: 'decimal', precision: 3, scale: 2 })
  rating: number;
}
