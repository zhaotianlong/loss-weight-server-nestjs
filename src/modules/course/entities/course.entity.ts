import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('public_courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'course_id' })
  courseId: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  coach: string;

  @Column({ nullable: true, name: 'coach_id' })
  coachId: string;

  @Column({ type: 'jsonb', nullable: true })
  coaches: any[];

  @Column({ nullable: true })
  duration: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true, name: 'camp_id' })
  campId: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
