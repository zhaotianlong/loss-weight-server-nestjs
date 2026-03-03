import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Camp } from './entities/camp.entity';
import { Room } from './entities/room.entity';
import { CampRoomType } from './entities/camp-room-type.entity';
import { Bed } from './entities/bed.entity';
import { Facility } from './entities/facility.entity';
import { Student } from '../student/student.entity';
import { Tuition } from '../logistics/entities/tuition.entity';
import { StudentCheckin } from '../student-health/entities/student-checkin.entity';
import { isSuperAdmin } from '../../common/constants/permissions';

@Injectable()
export class CampService {
  constructor(
    @InjectRepository(Camp)
    private campRepo: Repository<Camp>,
    @InjectRepository(Room)
    private roomRepo: Repository<Room>,
    @InjectRepository(CampRoomType)
    private roomTypeRepo: Repository<CampRoomType>,
    @InjectRepository(Bed)
    private bedRepo: Repository<Bed>,
    @InjectRepository(Facility)
    private facilityRepo: Repository<Facility>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Tuition)
    private tuitionRepo: Repository<Tuition>,
    @InjectRepository(StudentCheckin)
    private checkinRepo: Repository<StudentCheckin>,
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 10, campName, address, status } = query;
    const where: any = {};

    if (campName) where.campName = Like(`%${campName}%`);
    if (address) where.address = Like(`%${address}%`);
    if (status !== undefined) where.status = Number(status);

    const [data, total] = await this.campRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      order: { campId: 'ASC' },
    });

    return {
      data,
      meta: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        pageCount: Math.ceil(total / Number(pageSize)),
      },
    };
  }

  async findOne(id: number) {
    const item = await this.campRepo.findOne({ where: { campId: id } });
    if (!item) throw new NotFoundException('Camp not found');
    return item;
  }

  async create(body: any) {
    const newCamp = this.campRepo.create({ ...body, currentNum: body.currentNum || 0 });
    return this.campRepo.save(newCamp);
  }

  async update(id: number, body: any) {
    await this.campRepo.update({ campId: id }, body);
    const updated = await this.campRepo.findOne({ where: { campId: id } });
    if (!updated) throw new NotFoundException('Camp not found');
    return updated;
  }

  async remove(id: number) {
    const result = await this.campRepo.delete({ campId: id });
    if (result.affected === 0) throw new NotFoundException('Camp not found');
    return { message: 'Deleted' };
  }

  // Room related methods
  async findAllRooms(query: any) {
    const { campId, roomNum, status } = query;
    const where: any = {};

    if (campId) where.campId = Number(campId);
    if (roomNum) where.roomNum = Like(`%${roomNum}%`);
    if (status !== undefined) where.status = Number(status);

    return this.roomRepo.find({ where, order: { roomNum: 'ASC' } });
  }

  async findOneRoom(id: number) {
    const item = await this.roomRepo.findOne({ where: { roomId: id }, relations: ['roomType'] });
    if (!item) throw new NotFoundException('Room not found');
    return item;
  }

  async createRoom(body: any) {
    const newRoom = this.roomRepo.create(body);
    return this.roomRepo.save(newRoom);
  }

  async updateRoom(id: number, body: any) {
    await this.roomRepo.update({ roomId: id }, body);
    const updated = await this.roomRepo.findOne({ where: { roomId: id } });
    if (!updated) throw new NotFoundException('Room not found');
    return updated;
  }

  async removeRoom(id: number) {
    const result = await this.roomRepo.delete({ roomId: id });
    if (result.affected === 0) throw new NotFoundException('Room not found');
    return { message: 'Deleted' };
  }

  async findAllRoomTypes() {
    return this.roomTypeRepo.find({ order: { roomTypeId: 'ASC' } });
  }

  async findOneRoomType(id: number) {
    const item = await this.roomTypeRepo.findOne({ where: { roomTypeId: id } });
    if (!item) throw new NotFoundException('Room type not found');
    return item;
  }

  async createRoomType(body: any) {
    const newType = this.roomTypeRepo.create(body);
    return this.roomTypeRepo.save(newType);
  }

  async updateRoomType(id: number, body: any) {
    await this.roomTypeRepo.update({ roomTypeId: id }, body);
    const updated = await this.roomTypeRepo.findOne({ where: { roomTypeId: id } });
    if (!updated) throw new NotFoundException('Room type not found');
    return updated;
  }

  async removeRoomType(id: number) {
    const result = await this.roomTypeRepo.delete({ roomTypeId: id });
    if (result.affected === 0) throw new NotFoundException('Room type not found');
    return { message: 'Deleted' };
  }

  async findAllBeds(query: any) {
    const { roomId, status } = query;
    const where: any = {};

    if (roomId) where.roomId = Number(roomId);
    if (status !== undefined) where.status = Number(status);

    return this.bedRepo.find({ where, order: { bedNum: 'ASC' } });
  }

  async findAllRoomsWithDetails(query: any) {
    const { campId, typeId, bedCount, roomName, studentName, roomNum, status, bedType } = query;
    
    const queryBuilder = this.roomRepo.createQueryBuilder('room')
      .leftJoinAndSelect('room.roomType', 'roomType')
      .leftJoinAndSelect('room.beds', 'bed')
      .leftJoinAndSelect('bed.student', 'student');

    if (campId) queryBuilder.andWhere('room.campId = :campId', { campId: Number(campId) });
    if (typeId) queryBuilder.andWhere('room.typeId = :typeId', { typeId: Number(typeId) });
    if (roomNum) queryBuilder.andWhere('room.roomNum LIKE :roomNum', { roomNum: `%${roomNum}%` });
    if (status !== undefined) queryBuilder.andWhere('room.status = :status', { status: Number(status) });
    if (bedCount) queryBuilder.andWhere('roomType.bedCount = :bedCount', { bedCount: Number(bedCount) });
    if (roomName) queryBuilder.andWhere('roomType.roomName LIKE :roomName', { roomName: `%${roomName}%` });
    if (bedType) queryBuilder.andWhere('roomType.bedType = :bedType', { bedType: Number(bedType) });

    let rooms = await queryBuilder.getMany();

    if (studentName) {
      rooms = rooms.filter(room => 
        room.beds.some((bed: any) => bed.student?.name.includes(studentName))
      );
    }

    return rooms;
  }

  async applyCheckin(body: any) {
    const { bedId, bedNum, roomId, roomTypeId, stuId, checkinDate, actualAmount, salespersonId } = body;
    const student = await this.studentRepo.findOne({ where: { stuId } });
    if (!student) throw new NotFoundException('Student not found');

    const newTuition = this.tuitionRepo.create({
      stuId,
      studentName: student.name,
      campId: student.campId,
      type: 'income',
      source: '学费(入住)',
      amount: actualAmount,
      date: checkinDate,
      status: '3', // 待审核
      salespersonId,
      applyInfo: { type: 'checkin', bedId, bedNum, roomId, roomTypeId, stuId, checkinDate }
    });
    await this.tuitionRepo.save(newTuition);

    if (bedId && bedId !== 0) {
      await this.bedRepo.update({ bedId }, { status: 2 }); // 锁定中
    }

    return true;
  }

  async applyChangeBed(body: any) {
    const { currentBedId, newBedId, stuId, actualAmount } = body;
    const student = await this.studentRepo.findOne({ where: { stuId } });
    if (!student) throw new NotFoundException('Student not found');

    const newTuition = this.tuitionRepo.create({
      stuId,
      studentName: student.name,
      campId: student.campId,
      type: 'income',
      source: '调房费',
      amount: actualAmount,
      date: new Date().toISOString().split('T')[0],
      status: '3', // 待审核
      applyInfo: { type: 'changeBed', currentBedId, newBedId, stuId }
    });
    await this.tuitionRepo.save(newTuition);

    await this.bedRepo.update({ bedId: newBedId }, { status: 2 });

    return true;
  }

  async checkoutStudent(body: any) {
    const { bedId, stuId, checkoutDate } = body;
    await this.studentRepo.update({ stuId }, { status: 3, checkoutDate });
    if (bedId) {
      await this.bedRepo.update({ bedId }, { stuId: undefined as any, status: 0 });
    }
    return true;
  }

  // Facility methods
  async findAllFacilities(query: any, currentUser: any) {
    const { campId, name, page = 1, pageSize = 20 } = query;
    const where: any = {};

    if (!isSuperAdmin(currentUser.role)) {
      where.campId = currentUser.campId;
    } else if (campId) {
      where.campId = Number(campId);
    }
    if (name) where.name = Like(`%${name}%`);

    const [data, total] = await this.facilityRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      order: { id: 'DESC' },
    });

    return {
      data,
      meta: { page: Number(page), pageSize: Number(pageSize), total, pageCount: Math.ceil(total / Number(pageSize)) },
    };
  }

  async findOneFacility(id: number, currentUser: any) {
    const item = await this.facilityRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('未找到设施');
    if (!isSuperAdmin(currentUser.role) && item.campId !== currentUser.campId) {
      throw new ForbiddenException('无权查看此营地设施');
    }
    return item;
  }

  async createFacility(body: any, currentUser: any) {
    if (!isSuperAdmin(currentUser.role) && currentUser.role !== '营地管理员') {
      throw new ForbiddenException('无权操作');
    }
    if (!body.name) throw new BadRequestException('场地名称不能为空');
    const campId = body.campId || (!isSuperAdmin(currentUser.role) ? currentUser.campId : null);
    if (!campId) throw new BadRequestException('所属营地不能为空');

    const newFacility = this.facilityRepo.create({ ...body, campId });
    return this.facilityRepo.save(newFacility);
  }

  async updateFacility(id: number, body: any, currentUser: any) {
    if (!isSuperAdmin(currentUser.role) && currentUser.role !== '营地管理员') {
      throw new ForbiddenException('无权操作');
    }
    const existing = await this.facilityRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('未找到设施');
    if (!isSuperAdmin(currentUser.role) && existing.campId !== currentUser.campId) {
      throw new ForbiddenException('无权操作此营地设施');
    }
    await this.facilityRepo.update(id, body);
    return this.facilityRepo.findOne({ where: { id } });
  }

  async removeFacility(id: number, currentUser: any) {
    if (!isSuperAdmin(currentUser.role) && currentUser.role !== '营地管理员') {
      throw new ForbiddenException('无权操作');
    }
    const existing = await this.facilityRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('未找到设施');
    if (!isSuperAdmin(currentUser.role) && existing.campId !== currentUser.campId) {
      throw new ForbiddenException('无权操作此营地设施');
    }
    await this.facilityRepo.delete(id);
    return { message: 'Deleted' };
  }
}
