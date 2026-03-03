import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('private_course_configs')
export class PrivateCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'course_id' })
  courseId: number;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column()
  type: string;

  @Column({ nullable: true, name: 'payment_type' })
  paymentType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'monthly_price' })
  monthlyPrice: number;

  @Column({ nullable: true, name: 'monthly_sessions' })
  monthlySessions: number;

  @Column({ name: 'duration' })
  duration: number;

  @Column({ default: 1, name: 'status' })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
