import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import dayjs from 'dayjs';

@Entity('tuition')
export class Tuition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stu_id' })
  stuId: number;

  @Column({ name: 'student_name' })
  studentName: string;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column()
  type: string;

  @Column()
  source: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    transformer: {
      to: (value: string) => value,
      from: (value: Date | string) => value ? dayjs(value).format('YYYY-MM-DD') : value
    }
  })
  date: string;

  @Column()
  status: string; // 'paid', 'pending', 'rejected', '3', '4'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, name: 'salesperson_id' })
  salespersonId: string;

  @Column({ type: 'jsonb', nullable: true, name: 'apply_info' })
  applyInfo: any;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
