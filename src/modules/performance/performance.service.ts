import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceGoal } from './entities/performance-goal.entity';
import { Tuition } from '../logistics/entities/tuition.entity';
import { StuPrivateOrder } from '../private-purchase/entities/stu-private-order.entity';
import { Student } from '../student/student.entity';
import { Camp } from '../camp/entities/camp.entity';
import { isSuperAdmin } from '../../common/constants/permissions';
import dayjs from 'dayjs';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformanceGoal)
    private goalRepo: Repository<PerformanceGoal>,
    @InjectRepository(Tuition)
    private tuitionRepo: Repository<Tuition>,
    @InjectRepository(StuPrivateOrder)
    private privateOrderRepo: Repository<StuPrivateOrder>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Camp)
    private campRepo: Repository<Camp>,
  ) {}

  async findAllGoals(query: any, currentUser: any) {
    const { campId, coachId, month } = query;
    const where: any = {};

    if (currentUser && !isSuperAdmin(currentUser.role)) {
      where.campId = currentUser.campId;
      if (campId && Number(campId) !== currentUser.campId) {
        throw new ForbiddenException('无权访问其他营地的数据');
      }
    } else if (campId) {
      where.campId = Number(campId);
    }

    if (coachId) where.coachId = coachId;
    if (month) where.month = month;

    const goals = await this.goalRepo.find({ where });

    const tuitions = await this.tuitionRepo.find();
    const privateOrders = await this.privateOrderRepo.find();
    const students = await this.studentRepo.find();
    const studentMap = new Map(students.map(s => [s.stuId, s]));
    
    const camps = await this.campRepo.find();
    const campMap = new Map(camps.map(c => [c.campId, c]));

    return goals.map(goal => {
      const recruitmentActual = tuitions
        .filter((t: any) => {
          const tDate = dayjs(t.date).format('YYYY-MM');
          return t.salespersonId === goal.coachId && tDate === goal.month && 
            t.source.includes('入住') && (t.status === '1' || t.status === 'paid' || t.status === '3') &&
            t.campId === goal.campId;
        })
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      const privateCoachingActual = privateOrders
        .filter((o: any) => {
          const student = studentMap.get(o.stuId);
          const oDate = dayjs(o.orderTime).format('YYYY-MM');
          return o.bookingCoachId === goal.coachId && oDate === goal.month &&
            (o.status === '已完成' || o.status === '上课中') && student?.campId === goal.campId;
        })
        .reduce((sum: number, o: any) => sum + Number(o.totalPrice || 0), 0);

      const renewalActual = tuitions
        .filter((t: any) => {
          const tDate = dayjs(t.date).format('YYYY-MM');
          return t.salespersonId === goal.coachId && tDate === goal.month && 
            t.source.includes('续住') && (t.status === '1' || t.status === 'paid' || t.status === '3') &&
            t.campId === goal.campId;
        })
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      return {
        ...goal,
        campName: campMap.get(goal.campId)?.campName || `营地${goal.campId}`,
        actual: { recruitment: recruitmentActual, privateCoaching: privateCoachingActual, renewal: renewalActual }
      };
    });
  }

  async createGoal(body: any) {
    const newGoal = this.goalRepo.create(body);
    return this.goalRepo.save(newGoal);
  }

  async updateGoal(id: number, body: any) {
    await this.goalRepo.update(id, body);
    const updated = await this.goalRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('未找到业绩目标');
    return updated;
  }

  async removeGoal(id: number) {
    const result = await this.goalRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('未找到业绩目标');
    return { message: '删除成功' };
  }

  async getStats(query: any, currentUser: any) {
    const { campId, month = dayjs().format('YYYY-MM') } = query;
    const where: any = {};

    if (currentUser && !isSuperAdmin(currentUser.role)) {
      where.campId = currentUser.campId;
    } else if (campId) {
      where.campId = Number(campId);
    }
    where.month = month;

    const goals = await this.goalRepo.find({ where });

    const tuitions = await this.tuitionRepo.find();
    const privateOrders = await this.privateOrderRepo.find();
    const students = await this.studentRepo.find();
    const studentMap = new Map(students.map(s => [s.stuId, s]));

    const camps = await this.campRepo.find();
    const campMap = new Map(camps.map(c => [c.campId, c]));

    const coachStats = goals.map(goal => {
      const recruitmentActual = tuitions
        .filter((t: any) => {
          const tDate = dayjs(t.date).format('YYYY-MM');
          return t.salespersonId === goal.coachId && tDate === goal.month && 
            t.source.includes('入住') && (t.status === '1' || t.status === 'paid' || t.status === '3') &&
            t.campId === goal.campId;
        })
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      const privateCoachingActual = privateOrders
        .filter((o: any) => {
          const student = studentMap.get(o.stuId);
          const oDate = dayjs(o.orderTime).format('YYYY-MM');
          return o.bookingCoachId === goal.coachId && oDate === goal.month &&
            (o.status === '已完成' || o.status === '上课中') && student?.campId === goal.campId;
        })
        .reduce((sum: number, o: any) => sum + Number(o.totalPrice || 0), 0);

      const renewalActual = tuitions
        .filter((t: any) => {
          const tDate = dayjs(t.date).format('YYYY-MM');
          return t.salespersonId === goal.coachId && tDate === goal.month && 
            t.source.includes('续住') && (t.status === '1' || t.status === 'paid' || t.status === '3') &&
            t.campId === goal.campId;
        })
        .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      return {
        coachId: goal.coachId, coachName: goal.coachName, month: goal.month,
        goals: { recruitment: goal.recruitmentGoal, privateCoaching: goal.privateCoachingGoal, renewal: goal.renewalGoal, renewalType: goal.renewalType },
        actual: { recruitment: recruitmentActual, privateCoaching: privateCoachingActual, renewal: renewalActual }
      };
    });

    return {
      month, campId: where.campId,
      campName: where.campId ? campMap.get(where.campId)?.campName : '所有营地',
      summary: {
        totalRecruitmentGoal: goals.reduce((sum, g) => sum + Number(g.recruitmentGoal || 0), 0),
        totalRecruitmentActual: coachStats.reduce((sum, s) => sum + s.actual.recruitment, 0),
        totalPrivateCoachingGoal: goals.reduce((sum, g) => sum + Number(g.privateCoachingGoal || 0), 0),
        totalPrivateCoachingActual: coachStats.reduce((sum, s) => sum + s.actual.privateCoaching, 0),
        totalRenewalGoal: goals.reduce((sum, g) => sum + (g.renewalType === 'amount' ? Number(g.renewalGoal || 0) : 0), 0),
        totalRenewalActual: coachStats.reduce((sum, s) => sum + (s.goals.renewalType === 'amount' ? s.actual.renewal : 0), 0),
      },
      coachStats
    };
  }
}
