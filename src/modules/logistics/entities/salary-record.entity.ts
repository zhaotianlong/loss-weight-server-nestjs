import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('salaries')
export class SalaryRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'emp_id' })
  empId: string;

  @Column()
  month: string; // YYYY-MM

  @Column({ name: 'camp_id' })
  campId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'base_salary' })
  baseSalary: number;

  @Column({ type: 'jsonb' })
  commissions: {
    recruitment: number;
    privateCoaching: number;
    renewal: number;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  other: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
