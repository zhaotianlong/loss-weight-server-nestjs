import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StuBodyData } from './entities/stu-body-data.entity';
import { StudentCheckin } from './entities/student-checkin.entity';
import { Student } from '../student/student.entity';
import { Bed } from '../camp/entities/bed.entity';

@Injectable()
export class StudentHealthService {
  constructor(
    @InjectRepository(StuBodyData)
    private bodyDataRepo: Repository<StuBodyData>,
    @InjectRepository(StudentCheckin)
    private checkinRepo: Repository<StudentCheckin>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Bed)
    private bedRepo: Repository<Bed>,
  ) {}

  // Body Data
  async findAllBodyData(query: any) {
    const { stuId, measuredAt, page = 1, pageSize = 20 } = query;
    const where: any = {};

    if (stuId) where.stuId = Number(stuId);
    if (measuredAt) where.date = measuredAt;

    const [data, total] = await this.bodyDataRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      order: { date: 'DESC' },
    });

    return {
      success: true,
      data,
      meta: { page: Number(page), pageSize: Number(pageSize), total, pageCount: Math.ceil(total / Number(pageSize)) },
    };
  }

  async findOneBodyData(id: number) {
    const item = await this.bodyDataRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Not found');
    return { success: true, data: item };
  }

  async createBodyData(body: any) {
    const newData = this.bodyDataRepo.create(body);
    const data = await this.bodyDataRepo.save(newData);
    return { success: true, data };
  }

  async updateBodyData(id: number, body: any) {
    await this.bodyDataRepo.update(id, body);
    const updated = await this.bodyDataRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Not found');
    return { success: true, data: updated };
  }

  async removeBodyData(id: number) {
    const result = await this.bodyDataRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Not found');
    return { success: true, message: 'Deleted' };
  }

  // Checkins
  async findAllCheckins(query: any) {
    const { stuId, campId, checkinDate, status, page = 1, pageSize = 20 } = query;
    const where: any = {};

    if (stuId) where.stuId = Number(stuId);
    if (campId) where.campId = Number(campId);
    if (checkinDate) where.checkinDate = checkinDate;
    if (status !== undefined) where.status = Number(status);

    const [data, total] = await this.checkinRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      order: { checkinDate: 'DESC' },
    });

    return {
      success: true,
      data,
      meta: { page: Number(page), pageSize: Number(pageSize), total, pageCount: Math.ceil(total / Number(pageSize)) },
    };
  }

  async findOneCheckin(id: number) {
    const item = await this.checkinRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Not found');
    return { success: true, data: item };
  }

  async createCheckin(body: any) {
    const { stuId, campId, checkinDate, bedId } = body;
    
    if (bedId) {
      const bed = await this.bedRepo.findOne({ where: { bedId } });
      if (bed && bed.stuId && bed.stuId !== stuId) {
        throw new BadRequestException('该床位已被占用');
      }
    }

    const newCheckin = this.checkinRepo.create({ ...body, status: body.status ?? 1 });
    await this.checkinRepo.save(newCheckin);

    await this.studentRepo.update({ stuId }, {
      status: 1,
      checkinDate: checkinDate || new Date().toISOString().split('T')[0],
      bedId: bedId || body.bedId,
      campId: campId
    });

    if (bedId) {
      await this.bedRepo.update({ bedId }, {
        stuId: stuId,
        status: 1
      });
    }

    return { success: true, data: newCheckin };
  }

  async updateCheckin(id: number, body: any) {
    await this.checkinRepo.update(id, body);
    const updated = await this.checkinRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Not found');
    return { success: true, data: updated };
  }

  async removeCheckin(id: number) {
    const result = await this.checkinRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Not found');
    return { success: true, message: 'Deleted' };
  }
}
