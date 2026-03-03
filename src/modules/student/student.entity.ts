import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import dayjs from 'dayjs';
import { Camp } from '../camp/entities/camp.entity';
import { Bed } from '../camp/entities/bed.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'stu_id' })
  stuId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ unique: true, nullable: true, name: 'id_card' })
  idCard: string;

  @Column({ unique: true })
  phone: string;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column({ nullable: true, name: 'bed_id' })
  bedId: number;

  @Column({
    type: 'date',
    nullable: true,
    name: 'checkin_date',
    transformer: {
      to: (value: string) => value,
      from: (value: Date | string) => value ? dayjs(value).format('YYYY-MM-DD') : value
    }
  })
  checkinDate: string | null;

  @Column({
    type: 'date',
    nullable: true,
    name: 'checkout_date',
    transformer: {
      to: (value: string) => value,
      from: (value: Date | string) => value ? dayjs(value).format('YYYY-MM-DD') : value
    }
  })
  checkoutDate: string | null;

  @Column({ type: 'text', nullable: true, name: 'diet_taboo' })
  dietTaboo: string;

  @Column({ default: 0, name: 'payment_status' })
  paymentStatus: number;

  @Column({ default: 1 })
  status: number; // 1: 在营, 2: 离营, 3: 已退费

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'initial_weight' })
  initialWeight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'current_weight' })
  currentWeight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'initial_fat_rate' })
  initialFatRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'current_fat_rate' })
  currentFatRate: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @ManyToOne(() => Camp)
  @JoinColumn({ name: 'camp_id', referencedColumnName: 'campId' })
  camp: Camp;

  @ManyToOne(() => Bed)
  @JoinColumn({ name: 'bed_id', referencedColumnName: 'bedId' })
  bed: Bed;
}
