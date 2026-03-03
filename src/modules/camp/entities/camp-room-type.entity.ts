import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Camp } from './camp.entity';

@Entity('room_types')
export class CampRoomType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'room_type_id' })
  roomTypeId: number;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column({ name: 'room_name' })
  roomName: string;

  @Column({ name: 'bed_count' })
  bedCount: number;

  @Column({ default: 0, name: 'bed_type' })
  bedType: number; // 0: 单层, 1: 上下铺

  @Column({ default: 1, name: 'room_status' })
  roomStatus: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'upper_price' })
  upperPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'lower_price' })
  lowerPrice: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @ManyToOne(() => Camp, (camp) => camp.roomTypes)
  @JoinColumn({ name: 'camp_id', referencedColumnName: 'campId' })
  camp: Camp;
}
