import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Room } from './room.entity';
import { CampRoomType } from './camp-room-type.entity';
import { Student } from '../../student/student.entity';

@Entity('beds')
export class Bed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'bed_id' })
  bedId: number;

  @Column({ name: 'room_id' })
  roomId: number;

  @Column({ name: 'room_type_id' })
  roomTypeId: number;

  @Column({ name: 'bed_num' })
  bedNum: string;

  @Column({ type: 'int', nullable: true, name: 'stu_id' })
  stuId: number | null;

  @Column({ default: 1 })
  status: number; // 0: 维修, 1: 正常, 2: 锁定

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @ManyToOne(() => Room, (room) => room.beds)
  @JoinColumn({ name: 'room_id', referencedColumnName: 'roomId' })
  room: Room;

  @ManyToOne(() => CampRoomType)
  @JoinColumn({ name: 'room_type_id', referencedColumnName: 'roomTypeId' })
  roomType: CampRoomType;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'stu_id', referencedColumnName: 'stuId' })
  student: Student;
}
