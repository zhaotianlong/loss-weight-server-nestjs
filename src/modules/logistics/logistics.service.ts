import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, Between } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { Tuition } from './entities/tuition.entity';
import { Renewal } from './entities/renewal.entity';
import { SalaryRecord } from './entities/salary-record.entity';
import { CommissionStrategy } from './entities/commission-strategy.entity';
import { Student } from '../student/student.entity';
import { Bed } from '../camp/entities/bed.entity';
import { StudentCheckin } from '../student-health/entities/student-checkin.entity';
import { Employee } from '../user/entities/employee.entity';
import { StuPrivateOrder } from '../private-purchase/entities/stu-private-order.entity';
import { isSuperAdmin } from '../../common/constants/permissions';
import dayjs from 'dayjs';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepo: Repository<Recipe>,
    @InjectRepository(Tuition)
    private tuitionRepo: Repository<Tuition>,
    @InjectRepository(Renewal)
    private renewalRepo: Repository<Renewal>,
    @InjectRepository(SalaryRecord)
    private salaryRepo: Repository<SalaryRecord>,
    @InjectRepository(CommissionStrategy)
    private strategyRepo: Repository<CommissionStrategy>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Bed)
    private bedRepo: Repository<Bed>,
    @InjectRepository(StudentCheckin)
    private checkinRepo: Repository<StudentCheckin>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(StuPrivateOrder)
    private privateOrderRepo: Repository<StuPrivateOrder>,
  ) {}

  // Recipe methods
  async findAllRecipes(query: any, currentUser: any) {
    const { campId, name, category, page = 1, pageSize = 20 } = query;
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
    if (category) where.category = category;

    const [data, total] = await this.recipeRepo.findAndCount({
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

  async createRecipe(body: any) {
    const newRecipe = this.recipeRepo.create(body);
    return this.recipeRepo.save(newRecipe);
  }

  async updateRecipe(id: string, body: any) {
    await this.recipeRepo.update(id, body);
    const updated = await this.recipeRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Not found');
    return updated;
  }

  async findOneRecipe(id: string) {
    const item = await this.recipeRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Recipe not found');
    return item;
  }

  async removeRecipe(id: string) {
    const result = await this.recipeRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Not found');
    return { message: 'Deleted' };
  }

  // Tuition methods
  async findAllTuition(query: any, currentUser: any) {
    const { campId, studentId, status, page = 1, pageSize = 20 } = query;
    const where: any = {};

    if (currentUser && !isSuperAdmin(currentUser.role)) {
      where.campId = currentUser.campId;
      if (campId && Number(campId) !== currentUser.campId) {
        throw new ForbiddenException('无权访问其他营地的数据');
      }
    } else if (campId) {
      where.campId = Number(campId);
    }

    if (studentId) where.stuId = Number(studentId);
    if (status !== undefined) where.status = status.toString();

    const [data, total] = await this.tuitionRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      order: { date: 'DESC' },
    });

    return {
      data,
      meta: { page: Number(page), pageSize: Number(pageSize), total, pageCount: Math.ceil(total / Number(pageSize)) },
    };
  }

  async findOneTuition(id: number) {
    const item = await this.tuitionRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Tuition record not found');
    return item;
  }

  async createTuition(body: any) {
    const newTuition = this.tuitionRepo.create(body);
    return this.tuitionRepo.save(newTuition);
  }

  async updateTuition(id: number, body: any) {
    await this.tuitionRepo.update(id, body);
    const updated = await this.tuitionRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Tuition record not found');
    return updated;
  }

  async removeTuition(id: number) {
    const result = await this.tuitionRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Tuition record not found');
    return { message: 'Deleted' };
  }

  async findAllTuitionRenewal(query: any) {
    const { stuId } = query;
    const where: any = {};
    if (stuId) where.stuId = Number(stuId);
    return this.renewalRepo.find({ where, order: { createTime: 'DESC' } });
  }

  async createTuitionRenewal(body: any) {
    const newRenewal = this.renewalRepo.create(body);
    return this.renewalRepo.save(newRenewal);
  }

  async approveTuition(id: number) {
    const tuition = await this.tuitionRepo.findOne({ where: { id } });
    if (!tuition) throw new NotFoundException('未找到该记录');
    if (tuition.status !== '3') return { success: false, message: '只有待审核的记录可以审核' };

    const { applyInfo } = tuition;
    if (!applyInfo) return { success: false, message: '缺少申请信息' };

    await this.tuitionRepo.update(id, {
      status: '1',
      date: new Date().toISOString().split('T')[0],
    });

    if (applyInfo.type === 'checkin') {
      const { bedId, bedNum, roomId, roomTypeId, stuId, checkinDate } = applyInfo;
      const student = await this.studentRepo.findOne({ where: { stuId } });

      let finalBedId = bedId;
      if (bedId === 0) {
        const existingBed = await this.bedRepo.findOne({ where: { roomId, bedNum } });
        if (existingBed) {
          await this.bedRepo.update({ bedId: existingBed.bedId }, { stuId, status: 1 });
          finalBedId = existingBed.bedId;
        } else {
          const newBed = this.bedRepo.create({ roomId, roomTypeId, bedNum, stuId, status: 1 });
          const savedBed = await this.bedRepo.save(newBed);
          finalBedId = savedBed.bedId;
        }
      } else {
        await this.bedRepo.update({ bedId }, { stuId, status: 1 });
      }

      await this.studentRepo.update({ stuId }, {
        bedId: finalBedId, checkinDate, checkoutDate: undefined as any, status: 1,
      });

      const newCheckin = this.checkinRepo.create({
        stuId, campId: tuition.campId, checkinDate,
        checkinTime: new Date().toTimeString().slice(0, 5), status: 1,
      });
      await this.checkinRepo.save(newCheckin);
    } else if (applyInfo.type === 'renewal') {
      const { stuId, days } = applyInfo;
      const student = await this.studentRepo.findOne({ where: { stuId } });
      if (!student) return { success: false, message: '未找到学员' };
      
      let newCheckoutDate: string;
      if (student.checkoutDate) {
        const currentExpire = dayjs(student.checkoutDate);
        newCheckoutDate = currentExpire.add(days, 'day').format('YYYY-MM-DD');
      } else {
        const checkin = dayjs(student.checkinDate);
        newCheckoutDate = checkin.add(30 + days, 'day').format('YYYY-MM-DD');
      }

      await this.studentRepo.update({ stuId }, { checkoutDate: newCheckoutDate });
      if (student.bedId) {
        await this.bedRepo.update({ bedId: student.bedId }, { status: 1 });
      }
    }

    return { message: '审核通过' };
  }

  async rejectTuition(id: number) {
    const tuition = await this.tuitionRepo.findOne({ where: { id } });
    if (!tuition) throw new NotFoundException('未找到该记录');
    if (tuition.status !== '3') return { success: false, message: '只有待审核的记录可以拒绝' };

    const { applyInfo } = tuition;
    await this.tuitionRepo.update(id, { status: '4' });

    if (applyInfo) {
      if (applyInfo.type === 'checkin') {
        const { bedId, bedNum, roomId } = applyInfo;
        if (bedId === 0) {
          const placeholderBed = await this.bedRepo.findOne({ where: { roomId, bedNum, status: 2 } });
          if (placeholderBed) await this.bedRepo.delete({ bedId: placeholderBed.bedId });
        } else {
          await this.bedRepo.update({ bedId }, { status: 1 });
        }
      } else if (applyInfo.type === 'renewal') {
        const { stuId } = applyInfo;
        const student = await this.studentRepo.findOne({ where: { stuId } });
        if (student && student.bedId) await this.bedRepo.update({ bedId: student.bedId }, { status: 1 });
      }
    }

    return { message: '已拒绝申请' };
  }

  // Salary methods
  async findAllSalary(query: any, currentUser: any) {
    const { campId, month } = query;
    const where: any = {};

    if (currentUser && !isSuperAdmin(currentUser.role)) {
      where.campId = currentUser.campId;
    } else if (campId) {
      where.campId = Number(campId);
    }

    const employees = await this.employeeRepo.find({ where });
    const tuitions = await this.tuitionRepo.find();
    const privateOrders = await this.privateOrderRepo.find();
    const manualRecords = await this.salaryRepo.find({ where });
    const strategies = await this.strategyRepo.find();
    const students = await this.studentRepo.find();
    const studentMap = new Map(students.map(s => [s.stuId, s]));

    const months = month ? [month] : Array.from(new Set([
      ...tuitions.map(t => dayjs(t.date).format('YYYY-MM')),
      ...privateOrders.map(o => dayjs(o.orderTime).format('YYYY-MM')),
      ...manualRecords.map(s => s.month)
    ])).sort().reverse();

    return months.map(m => {
      const details = employees.map(emp => {
        const recruitmentActual = tuitions
          .filter(t => t.salespersonId === emp.empId && dayjs(t.date).format('YYYY-MM') === m && t.source.includes('入住') && (t.status === '1' || t.status === 'paid' || t.status === '3'))
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const privateCoachingActual = privateOrders
          .filter(o => {
            const student = studentMap.get(o.stuId);
            return o.bookingCoachId === emp.empId && dayjs(o.orderTime).format('YYYY-MM') === m && (o.status === '已完成' || o.status === '上课中') && (!where.campId || student?.campId === where.campId);
          })
          .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

        const renewalActual = tuitions
          .filter(t => t.salespersonId === emp.empId && dayjs(t.date).format('YYYY-MM') === m && t.source.includes('续住') && (t.status === '1' || t.status === 'paid' || t.status === '3'))
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);

        const empStrategies = strategies.filter(s => s.month === m && s.role === emp.role);
        const recruitmentResult = emp.allowCommission ? this.calculateCommission(recruitmentActual, empStrategies.find(s => s.type === 'recruitment')?.gradients) : { commission: 0, rate: 0 };
        const privateResult = emp.allowCommission ? this.calculateCommission(privateCoachingActual, empStrategies.find(s => s.type === 'privateCoaching')?.gradients) : { commission: 0, rate: 0 };
        const renewalResult = emp.allowCommission ? this.calculateCommission(renewalActual, empStrategies.find(s => s.type === 'renewal')?.gradients) : { commission: 0, rate: 0 };

        const manualRecord = manualRecords.find(s => s.empId === emp.empId && s.month === m);
        const other = Number(manualRecord?.other || 0);
        const baseSalary = Number(emp.baseSalary || 0);
        const totalCommission = Number(recruitmentResult.commission || 0) + Number(privateResult.commission || 0) + Number(renewalResult.commission || 0);

        return {
          empId: emp.empId, empName: emp.name, role: emp.role, allowCommission: emp.allowCommission,
          baseSalary, commissions: { recruitment: recruitmentResult.commission, privateCoaching: privateResult.commission, renewal: renewalResult.commission },
          performance: { recruitment: { actual: recruitmentActual, rate: recruitmentResult.rate }, privateCoaching: { actual: privateCoachingActual, rate: privateResult.rate }, renewal: { actual: renewalActual, rate: renewalResult.rate } },
          other, totalSalary: baseSalary + totalCommission + other, remark: manualRecord?.remark || ''
        };
      }).filter(d => d.totalSalary > 0 || d.baseSalary > 0);

      const totalBase = details.reduce((sum, d) => sum + d.baseSalary, 0);
      const totalCommission = details.reduce((sum, d) => sum + d.commissions.recruitment + d.commissions.privateCoaching + d.commissions.renewal, 0);
      const totalOther = details.reduce((sum, d) => sum + d.other, 0);

      return {
        month: m, campId: where.campId, totalAmount: totalBase + totalCommission + totalOther,
        totalBase, totalCommission, totalOther, details
      };
    }).filter(r => r.totalAmount > 0);
  }

  private calculateCommission(amount: number, gradients: any[] | undefined) {
    if (!gradients || gradients.length === 0) return { commission: 0, rate: 0 };
    const sorted = [...gradients].sort((a, b) => b.threshold - a.threshold);
    const matched = sorted.find(g => amount >= g.threshold);
    const rate = matched ? matched.rate : 0;
    return { commission: amount * rate, rate };
  }

  async findAllStrategies(query: any) {
    const { month, role } = query;
    const where: any = {};
    if (month) where.month = month;
    if (role) where.role = role;
    return this.strategyRepo.find({ where, order: { month: 'DESC' } });
  }

  async saveStrategy(body: any) {
    if (body.id) {
      await this.strategyRepo.update(body.id, body);
    } else {
      const newStrategy = this.strategyRepo.create(body);
      await this.strategyRepo.save(newStrategy);
    }
    return true;
  }

  async removeStrategy(id: number) {
    await this.strategyRepo.delete(id);
    return true;
  }

  async removeSalaryRecord(id: number) {
    const result = await this.salaryRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Salary record not found');
    return { message: 'Deleted' };
  }

  async saveSalaryOther(body: any) {
    const { empId, month, other, remark, campId } = body;
    const existing = await this.salaryRepo.findOne({ where: { empId, month } });
    if (existing) {
      await this.salaryRepo.update(existing.id, { other, remark });
    } else {
      const newRecord = this.salaryRepo.create({ empId, month, other, remark, campId });
      await this.salaryRepo.save(newRecord);
    }
    return true;
  }
}
