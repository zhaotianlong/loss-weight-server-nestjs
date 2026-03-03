import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Camp } from './camp.entity';
import { CampRoomType } from './camp-room-type.entity';
import { Bed } from './bed.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'room_id' })
  roomId: number;

  @Column({ name: 'camp_id' })
  campId: number;

  @Column({ name: 'type_id' })
  typeId: number;

  @Column({ name: 'room_num' })
  roomNum: string;

  @Column({ name: 'bed_count' })
  bedCount: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @ManyToOne(() => Camp, (camp) => camp.rooms)
  @JoinColumn({ name: 'camp_id', referencedColumnName: 'campId' })
  camp: Camp;

  @ManyToOne(() => CampRoomType)
  @JoinColumn({ name: 'type_id', referencedColumnName: 'roomTypeId' })
  roomType: CampRoomType;

  @OneToMany(() => Bed, (bed) => bed.room)
  beds: Bed[];
}
