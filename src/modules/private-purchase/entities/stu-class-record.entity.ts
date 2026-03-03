import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('stu_class_records')
export class StuClassRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stu_id' })
  stuId: number;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ unique: true, name: 'record_id' })
  recordId: string;

  @Column({ name: 'teaching_coach' })
  teachingCoach: string;

  @Column({ name: 'teaching_coach_id' })
  teachingCoachId: string;

  @Column()
  location: string;

  @Column({ name: 'start_time' })
  startTime: string;

  @Column({ name: 'end_time' })
  endTime: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
