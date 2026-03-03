import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('stu_body_data')
export class StuBodyData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stu_id' })
  stuId: number;

  @Column()
  date: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'body_fat' })
  bodyFat: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  waist: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  hip: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  chest: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'muscle_rate' })
  muscleRate: number;

  @Column({ nullable: true, name: 'basal_metabolism' })
  basalMetabolism: number;

  @Column({ nullable: true, name: 'photo_url' })
  photoUrl: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
