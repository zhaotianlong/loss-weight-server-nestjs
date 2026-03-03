import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Employee } from '../user/entities/employee.entity';
import { Student } from '../student/student.entity';
import { CoachStudentRelation } from './entities/coach-student-relation.entity';
import { StuClassRecord } from '../private-purchase/entities/stu-class-record.entity';
import { StuPrivateOrder } from '../private-purchase/entities/stu-private-order.entity';
import { Course } from '../course/entities/course.entity';
import { Tuition } from '../logistics/entities/tuition.entity';
import { PerformanceStat } from '../performance/entities/performance-stat.entity';
import { CoachMonthlyPerformance } from '../performance/entities/coach-monthly-performance.entity';
import { PerformanceRanking } from '../performance/entities/performance-ranking.entity';
import { PrivateCourse } from '../course/entities/private-course.entity';
import { Duty } from '../duty/entities/duty.entity';
import dayjs from 'dayjs';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(CoachStudentRelation)
    private relationRepo: Repository<CoachStudentRelation>,
    @InjectRepository(StuClassRecord)
    private classRecordRepo: Repository<StuClassRecord>,
    @InjectRepository(StuPrivateOrder)
    private privateOrderRepo: Repository<StuPrivateOrder>,
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(Tuition)
    private tuitionRepo: Repository<Tuition>,
    @InjectRepository(PerformanceStat)
    private perfStatRepo: Repository<PerformanceStat>,
    @InjectRepository(CoachMonthlyPerformance)
    private monthlyPerfRepo: Repository<CoachMonthlyPerformance>,
    @InjectRepository(PerformanceRanking)
    private rankingRepo: Repository<PerformanceRanking>,
    @InjectRepository(PrivateCourse)
    private privateCourseRepo: Repository<PrivateCourse>,
    @InjectRepository(Duty)
    private dutyRepo: Repository<Duty>,
  ) {}

  async findAll(query: any) {
    const { page = 1, pageSize = 10, name, campId } = query;
    const where: any = { role: In(['教练', '教练管理员']) };

    if (name) where.name = Like(`%${name}%`);
    if (campId) where.campId = Number(campId);

    const [data, total] = await this.employeeRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      order: { empId: 'ASC' },
    });

    return {
      success: true,
      data,
      meta: { total, page: Number(page), pageSize: Number(pageSize) },
    };
  }

  async findResponsibleStudents(coachId: string) {
    const relations = await this.relationRepo.find({ where: { coachId, status: 'active' } });
    const studentIds = relations.map(r => r.studentId);
    
    if (studentIds.length === 0) return { success: true, data: [] };
    
    const responsibleStudents = await this.studentRepo.find({ where: { stuId: In(studentIds) } });
    return { success: true, data: responsibleStudents };
  }

  async findPrivateCourses(coachId: string) {
    const classRecords = await this.classRecordRepo.find({ where: { teachingCoachId: coachId } });
    
    const data = await Promise.all(classRecords.map(async (cls) => {
      const student = await this.studentRepo.findOne({ where: { stuId: cls.stuId } });
      const order = await this.privateOrderRepo.findOne({ where: { orderId: cls.orderId } });
      return {
        id: cls.id,
        studentName: student?.name || '未知学员',
        location: cls.location,
        startTime: cls.startTime,
        endTime: cls.endTime,
        duration: dayjs(cls.endTime).diff(dayjs(cls.startTime), 'minute'),
        courseType: order?.courseType || '未知课程',
        paymentType: order?.paymentType || '未知方式',
        isPublic: false
      };
    }));

    return { success: true, data };
  }

  async findPublicCourses(coachId: string) {
    // This is a bit tricky with JSONB coachIds, but we can use query builder
    const data = await this.courseRepo.createQueryBuilder('course')
      .where('course.coachId = :coachId', { coachId })
      .orWhere('course.coaches @> :coachJson', { coachJson: JSON.stringify([{ id: coachId }]) })
      .getMany();

    const result = data.map(c => ({
      id: c.courseId,
      location: (c as any).location || '大操场',
      startTime: c.createTime.toISOString(),
      duration: 60,
      courseType: c.title,
      isPublic: true
    }));

    return { success: true, data: result };
  }

  async getPerformance(type: string, coachId: string) {
    if (type === 'course') {
      const orders = await this.privateOrderRepo.find({ where: { bookingCoachId: coachId } });
      const data = await Promise.all(orders.map(async (order) => {
        const student = await this.studentRepo.findOne({ where: { stuId: order.stuId } });
        return {
          id: order.id,
          studentName: student?.name || '未知学员',
          courseType: order.courseType,
          paymentType: order.paymentType,
          amount: order.totalPrice,
          originalPrice: order.originalPrice,
          discountPrice: order.discountPrice,
          duration: `${order.usedSessions}/${order.totalSessions || (order.paymentType === '包月' ? 30 : order.totalSessions)} 节`,
          status: order.status,
          orderTime: order.orderTime,
          closeTime: order.closeTime,
          date: order.orderTime.split(' ')[0]
        };
      }));
      return { success: true, data };
    }

    if (type === 'enrollment') {
      const relations = await this.relationRepo.find({ where: { coachId } });
      const studentNames = relations.map(r => r.studentName);
      
      if (studentNames.length === 0) return { success: true, data: [] };

      const tuitions = await this.tuitionRepo.find({ where: { studentName: In(studentNames) } });
      const data = tuitions.map(t => ({
        id: t.id,
        studentName: t.studentName,
        tuitionType: t.source.includes('入住') ? '入营付费' : '到期续费',
        duration: '30天',
        amount: t.amount,
        status: t.status === '1' || t.status === 'paid' ? '已完成' : '待处理',
        orderTime: t.createTime.toISOString(),
        closeTime: t.updateTime.toISOString(),
        date: t.date
      }));
      return { success: true, data };
    }

    if (type === 'stats') {
      const stats = await this.perfStatRepo.findOne({ where: { coachId } });
      const monthlyDataRaw = await this.monthlyPerfRepo.find({ where: { coachId } });
      const rankings = await this.rankingRepo.find({ order: { rank: 'ASC' } });

      const monthlyData = monthlyDataRaw.map(m => ({ month: m.month, count: m.count }));

      const finalStats = stats ? { ...stats, monthlyData } : {
        coachId, coursesToComplete: 0, coursesSold: 0,
        monthlyData: Array.from({ length: 12 }, (_, i) => ({ month: `${i + 1}月`, count: 0 })),
        rating: 0,
      };

      return {
        success: true,
        data: { ...finalStats, rankings }
      };
    }

    throw new BadRequestException('未知业绩类型');
  }

  async createPrivateOrder(body: any) {
    const { coachId, stuId, courseId, paymentType, originalPrice, discountPrice, totalSessions } = body;
    
    // Check if coach can teach this course (mock logic had a separate relation table, we'll just check if coach exists)
    const coach = await this.employeeRepo.findOne({ where: { empId: coachId } });
    if (!coach) throw new NotFoundException('Coach not found');

    const course = await this.privateCourseRepo.findOne({ where: { courseId } });
    
    const newOrder = this.privateOrderRepo.create({
      stuId,
      orderId: `ORD${dayjs().format('YYYYMMDDHHmmss')}`,
      courseId,
      courseType: course?.type || '未知课程',
      paymentType,
      originalPrice,
      discountPrice,
      totalPrice: discountPrice,
      totalSessions,
      usedSessions: 0,
      status: '开单',
      orderTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      bookingCoach: coach.name,
      bookingCoachId: coachId,
    });
    
    const data = await this.privateOrderRepo.save(newOrder);
    return { success: true, data };
  }

  async recordClass(body: any) {
    const { orderId, teachingCoachId, location, startTime, endTime } = body;
    
    const order = await this.privateOrderRepo.findOne({ where: { orderId } });
    if (!order) throw new NotFoundException('未找到对应的私教订单');
    
    if (order.status === '已完成' || order.usedSessions >= order.totalSessions) {
      throw new BadRequestException('该订单课时已用完或已结束');
    }
    
    const coach = await this.employeeRepo.findOne({ where: { empId: teachingCoachId } });
    if (!coach) throw new NotFoundException('Coach not found');
    
    const newRecord = this.classRecordRepo.create({
      stuId: order.stuId,
      orderId: order.orderId,
      recordId: `REC${dayjs().format('YYYYMMDDHHmmss')}`,
      teachingCoach: coach.name,
      teachingCoachId,
      location,
      startTime,
      endTime,
    });
    
    await this.classRecordRepo.save(newRecord);
    
    order.usedSessions += 1;
    order.status = '上课中';
    
    if (order.usedSessions >= order.totalSessions) {
      order.status = '已完成';
      order.closeTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
    
    await this.privateOrderRepo.save(order);
    
    return { success: true, data: newRecord, orderStatus: order.status };
  }

  async getPerformanceOverview(coachId: string) {
    const stats = await this.perfStatRepo.findOne({ where: { coachId } });
    if (!stats) throw new NotFoundException('Coach performance not found');

    const monthlyDataRaw = await this.monthlyPerfRepo.find({ where: { coachId } });
    const monthlyData = monthlyDataRaw.map(m => ({ month: m.month, count: m.count }));

    return { success: true, data: { ...stats, monthlyData } };
  }

  async roomInspection(body: any) {
    const newDuty = this.dutyRepo.create({
      ...body,
      type: '查房',
      status: '待执行',
    });
    const data = await this.dutyRepo.save(newDuty);
    return { success: true, data };
  }

  async getStudentList(query: any) {
    const { page = 1, pageSize = 10, campId, coachName, studentName, status } = query;
    const where: any = {};

    if (campId) where.campId = Number(campId);
    if (coachName) where.coachName = Like(`%${coachName}%`);
    if (studentName) where.studentName = Like(`%${studentName}%`);
    if (status) where.status = status;

    const [data, total] = await this.relationRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      order: { createTime: 'DESC' },
    });

    return {
      success: true,
      data,
      meta: { total, page: Number(page), pageSize: Number(pageSize) },
    };
  }

  async getCoachList(campId?: number) {
    const where: any = { role: In(['教练', '教练管理员']) };
    if (campId) where.campId = Number(campId);

    const coaches = await this.employeeRepo.find({ where });

    return {
      success: true,
      data: coaches.map(c => ({
        label: c.name,
        value: c.empId,
        campId: c.campId
      })),
    };
  }

  async assignCoach(body: any) {
    const { studentId, coachId, startDate } = body;

    const targetStudent = await this.studentRepo.findOne({ where: { stuId: studentId } });
    const targetCoach = await this.employeeRepo.findOne({ where: { empId: coachId } });

    if (!targetStudent || !targetCoach) throw new BadRequestException('学生或教练不存在');

    const activeRelation = await this.relationRepo.findOne({
      where: { studentId, status: 'active' }
    });

    if (activeRelation) {
      await this.relationRepo.update(activeRelation.id, {
        status: 'transferred',
        endDate: startDate,
      });
    }

    const newRelation = this.relationRepo.create({
      campId: targetStudent.campId,
      coachId,
      coachName: targetCoach.name,
      studentId,
      studentName: targetStudent.name,
      startDate,
      status: 'active',
    });

    const data = await this.relationRepo.save(newRelation);
    return { success: true, data };
  }
}
