import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Camp } from '../../camp/entities/camp.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'emp_id' })
  empId: string;

  @Column()
  name: string;

  @Column()
  gender: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  role: string;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column({ nullable: true })
  qualification: string;

  @Column({ nullable: true, name: 'duty_area' })
  dutyArea: string;

  @Column({ type: 'date', nullable: true, name: 'hire_date' })
  hireDate: string;

  @Column({ default: 1 })
  status: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'base_salary' })
  baseSalary: number;

  @Column({ default: false, name: 'allow_commission' })
  allowCommission: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'commission_rates' })
  commissionRates: any;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @ManyToOne(() => Camp)
  @JoinColumn({ name: 'camp_id', referencedColumnName: 'campId' })
  camp: Camp;
}
