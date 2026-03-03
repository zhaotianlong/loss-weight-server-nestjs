import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('performance_rankings')
export class PerformanceRanking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  rank: number;
}
