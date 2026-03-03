import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('student_checkins')
export class StudentCheckin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stu_id' })
  stuId: number;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column({ name: 'checkin_date' })
  checkinDate: string;

  @Column({ nullable: true, name: 'checkin_time' })
  checkinTime: string;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
