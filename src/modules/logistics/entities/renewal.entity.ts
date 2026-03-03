import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('renewals')
export class Renewal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stuId: number;

  @Column()
  campId: number;

  @Column({ type: 'date', nullable: true })
  oldCheckoutDate: string;

  @Column({ type: 'date', nullable: true })
  newCheckoutDate: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: '3' })
  status: string; // 3: 待审核, 1: 已通过, 4: 已拒绝

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
}
