import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('commission_strategies')
export class CommissionStrategy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: string; // YYYY-MM

  @Column()
  role: string;

  @Column()
  type: string; // 'recruitment', 'privateCoaching', 'renewal'

  @Column({ type: 'jsonb' })
  gradients: any[];

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
