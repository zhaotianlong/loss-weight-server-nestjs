import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Room } from './room.entity';
import { CampRoomType } from './camp-room-type.entity';
import { Facility } from './facility.entity';

@Entity('camps')
export class Camp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'camp_id' })
  campId: number;

  @Column({ name: 'camp_name' })
  campName: string;

  @Column()
  address: string;

  @Column()
  capacity: number;

  @Column({ name: 'current_num' })
  currentNum: number;

  @Column({ nullable: true, name: 'contact_person' })
  contactPerson: string;

  @Column({ nullable: true, name: 'contact_phone' })
  contactPhone: string;

  @Column({ default: 1 })
  status: number;

  @Column({ type: 'date', nullable: true, name: 'create_date' })
  createDate: string;

  @Column({ type: 'date', nullable: true, name: 'open_date' })
  openDate: string;

  @Column({ type: 'date', nullable: true, name: 'close_date' })
  closeDate: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @OneToMany(() => Room, (room) => room.camp)
  rooms: Room[];

  @OneToMany(() => CampRoomType, (type) => type.camp)
  roomTypes: CampRoomType[];

  @OneToMany(() => Facility, (facility) => facility.camp)
  facilities: Facility[];
}
