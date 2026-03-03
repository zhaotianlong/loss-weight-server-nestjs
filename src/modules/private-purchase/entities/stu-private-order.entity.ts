import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('stu_private_orders')
export class StuPrivateOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stu_id' })
  stuId: number;

  @Column({ unique: true, name: 'order_id' })
  orderId: string;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({ name: 'course_type' })
  courseType: string;

  @Column({ name: 'payment_type' })
  paymentType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'original_price' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_price' })
  discountPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Column({ name: 'total_sessions' })
  totalSessions: number;

  @Column({ default: 0, name: 'used_sessions' })
  usedSessions: number;

  @Column()
  status: string; // '开单', '上课中', '已完成'

  @Column({ name: 'order_time' })
  orderTime: string;

  @Column({ nullable: true, name: 'close_time' })
  closeTime: string;

  @Column({ nullable: true, name: 'booking_coach' })
  bookingCoach: string;

  @Column({ nullable: true, name: 'booking_coach_id' })
  bookingCoachId: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
