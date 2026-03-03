import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('coach_student_relations')
export class CoachStudentRelation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column({ name: 'coach_id' })
  coachId: string;

  @Column({ name: 'coach_name' })
  coachName: string;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'student_name' })
  studentName: string;

  @Column({ name: 'start_date' })
  startDate: string;

  @Column({ nullable: true, name: 'end_date' })
  endDate: string;

  @Column()
  status: string; // 'active', 'ended', 'transferred'

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
