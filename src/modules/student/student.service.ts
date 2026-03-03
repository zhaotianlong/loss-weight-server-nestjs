import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Student } from './student.entity';
import { Bed } from '../camp/entities/bed.entity';
import { StudentCheckin } from '../student-health/entities/student-checkin.entity';
import { StuBodyData } from '../student-health/entities/stu-body-data.entity';
import { Tuition } from '../logistics/entities/tuition.entity';
import { CoachStudentRelation } from '../coach/entities/coach-student-relation.entity';
import { StuClassRecord } from '../private-purchase/entities/stu-class-record.entity';
import { isSuperAdmin } from '../../common/constants/permissions';
import dayjs from 'dayjs';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Bed)
    private bedRepo: Repository<Bed>,
    @InjectRepository(StudentCheckin)
    private checkinRepo: Repository<StudentCheckin>,
    @InjectRepository(StuBodyData)
    private bodyDataRepo: Repository<StuBodyData>,
    @InjectRepository(Tuition)
    private tuitionRepo: Repository<Tuition>,
    @InjectRepository(CoachStudentRelation)
    private relationRepo: Repository<CoachStudentRelation>,
    @InjectRepository(StuClassRecord)
    private classRecordRepo: Repository<StuClassRecord>,
  ) {}

  async getPrivateRecords(stuId: number) {
    return this.classRecordRepo.find({ where: { stuId }, order: { startTime: 'DESC' } });
  }

  async findAll(query: any, currentUser: any) {
    const { campId, name, phone, status, page = 1, pageSize = 20 } = query;
    const where: any = {};

    if (currentUser && !isSuperAdmin(currentUser.role)) {
      where.campId = currentUser.campId;
      if (campId && Number(campId) !== currentUser.campId) {
        throw new ForbiddenException('无权访问其他营地的数据');
      }
    } else if (campId) {
      where.campId = Number(campId);
    }

    if (name) where.name = Like(`%${name}%`);
    if (phone) where.phone = Like(`%${phone}%`);
    if (status !== undefined) where.status = Number(status);

    const [students, total] = await this.studentRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      order: { stuId: 'DESC' },
    });

    // Fetch active coach relations
    const stuIds = students.map(s => s.stuId);
    let data = students;
    if (stuIds.length > 0) {
      const relationsData = await this.relationRepo.find({
        where: {
          studentId: In(stuIds),
          status: 'active'
        }
      });
      
      const relationMap = new Map(relationsData.map(r => [r.studentId, r]));
      
      data = students.map(student => {
        const relation = relationMap.get(student.stuId);
        return {
          ...student,
          coachId: relation?.coachId,
          coachName: relation?.coachName,
        };
      });
    }

    return {
      data,
      meta: { page: Number(page), pageSize: Number(pageSize), total, pageCount: Math.ceil(total / Number(pageSize)) },
    };
  }

  async findOne(id: number) {
    const student = await this.studentRepo.findOne({ where: { stuId: id } });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async create(body: any) {
    const newStudent = this.studentRepo.create(body);
    return this.studentRepo.save(newStudent);
  }

  async update(id: number, body: any) {
    await this.studentRepo.update({ stuId: id }, body);
    const updated = await this.studentRepo.findOne({ where: { stuId: id } });
    if (!updated) throw new NotFoundException('Student not found');
    return updated;
  }

  async remove(id: number) {
    const result = await this.studentRepo.delete({ stuId: id });
    if (result.affected === 0) throw new NotFoundException('Student not found');
    return { message: 'Deleted' };
  }

  async applyRenew(body: any) {
    const { stuId, days, originalAmount, actualAmount, salespersonId } = body;
    if (!stuId || !days || days <= 0) return { code: 4004, msg: '参数错误', success: false };

    const student = await this.studentRepo.findOne({ where: { stuId } });
    if (!student) return { code: 4005, msg: '学员不存在', success: false };

    const newTuition = this.tuitionRepo.create({
      stuId,
      studentName: student.name,
      campId: student.campId,
      type: 'income',
      source: '学费(续住)',
      amount: actualAmount,
      date: dayjs().format('YYYY-MM-DD'),
      status: '3', // 待审核
      description: `申请续租: ${days}天`,
      salespersonId,
      applyInfo: { type: 'renewal', stuId, days, salespersonId }
    });
    await this.tuitionRepo.save(newTuition);

    if (student.bedId) {
      await this.bedRepo.update({ bedId: student.bedId }, { status: 2 });
    }

    return { code: 200, success: true, msg: '申请续租成功，请等待财务审核', data: null };
  }

  async findAllBodyData(stuId: number) {
    return this.bodyDataRepo.find({ where: { stuId }, order: { date: 'DESC' } });
  }

  async createBodyData(stuId: number, body: any) {
    const newData = this.bodyDataRepo.create({ ...body, stuId });
    return this.bodyDataRepo.save(newData);
  }

  async findAllCheckin(query: any) {
    const { campId, date } = query;
    const where: any = {};
    if (campId) where.campId = Number(campId);
    if (date) where.checkinDate = date;
    return this.checkinRepo.find({ where, order: { checkinDate: 'DESC' } });
  }
}
