import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import dayjs from 'dayjs';

@Entity('duties')
export class Duty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column({
    transformer: {
      to: (value: string) => value,
      from: (value: Date | string) => value ? dayjs(value).format('YYYY-MM-DD') : value
    }
  })
  date: string;

  @Column({ nullable: true, name: 'time_slot' })
  timeSlot: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  type: string; // 'meal', 'training', 'duty', '查房'

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  coach: string;

  @Column({ type: 'jsonb', nullable: true, name: 'coach_ids' })
  coachIds: string[];

  @Column({ nullable: true, name: 'meal_type' })
  mealType: string;

  @Column({ nullable: true })
  calories: number;

  @Column({ nullable: true })
  protein: number;

  @Column({ nullable: true })
  carbs: number;

  @Column({ nullable: true })
  fat: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ nullable: true, name: 'course_id' })
  courseId: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
