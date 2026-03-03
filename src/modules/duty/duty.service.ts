import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Duty } from './entities/duty.entity';
import { isSuperAdmin } from '../../common/constants/permissions';
import dayjs from 'dayjs';

@Injectable()
export class DutyService {
  constructor(
    @InjectRepository(Duty)
    private dutyRepo: Repository<Duty>,
  ) {}

  async findAll(query: any, currentUser: any) {
    const { 
      coach, coachId, coachIds, date, location, status, campId, type, mealType,
      page = 1, pageSize = 20 
    } = query;

    const queryBuilder = this.dutyRepo.createQueryBuilder('duty');

    // 1. 营地隔离
    if (!isSuperAdmin(currentUser.role)) {
      queryBuilder.andWhere('duty.campId = :campId', { campId: currentUser.campId });
    } else if (campId) {
      queryBuilder.andWhere('duty.campId = :campId', { campId: Number(campId) });
    }

    // 2. 基础过滤
    if (coach) queryBuilder.andWhere('duty.coach LIKE :coach', { coach: `%${coach}%` });
    if (coachId) {
      queryBuilder.andWhere('(duty.coachId = :coachId OR duty.coachIds @> :coachIdJson)', { 
        coachId, 
        coachIdJson: JSON.stringify([coachId]) 
      });
    }
    if (coachIds) {
      const ids = Array.isArray(coachIds) ? coachIds : [coachIds];
      queryBuilder.andWhere('duty.coachIds ?| :ids', { ids });
    }
    if (date) queryBuilder.andWhere('duty.date = :date', { date });
    if (location) queryBuilder.andWhere('duty.location LIKE :location', { location: `%${location}%` });
    if (status) queryBuilder.andWhere('duty.status = :status', { status });
    if (type) queryBuilder.andWhere('duty.type = :type', { type });
    if (mealType) queryBuilder.andWhere('duty.mealType = :mealType', { mealType });

    // 3. 角色职能过滤
    if (currentUser.role === '教练管理') queryBuilder.andWhere('duty.type = :type', { type: 'training' });
    if (currentUser.role === '后勤管理') queryBuilder.andWhere('duty.type = :type', { type: 'meal' });

    const [data, total] = await queryBuilder
      .skip((Number(page) - 1) * Number(pageSize))
      .take(Number(pageSize))
      .orderBy('duty.date', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data,
      meta: { page: Number(page), pageSize: Number(pageSize), total, pageCount: Math.ceil(total / Number(pageSize)) },
    };
  }

  async findOne(id: number) {
    const item = await this.dutyRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('未找到记录');
    return { success: true, data: item };
  }

  async create(body: any, currentUser: any) {
    if (!isSuperAdmin(currentUser.role)) {
      if (dayjs(body.date).isBefore(dayjs(), 'day')) {
        throw new ForbiddenException('不能创建过时排班');
      }
      if (currentUser.role === '教练管理' && body.type !== 'training') {
        throw new ForbiddenException('只能创建教练排班');
      }
      if (currentUser.role === '后勤管理' && body.type !== 'meal') {
        throw new ForbiddenException('只能创建后勤排班');
      }
    }

    const newDuty = this.dutyRepo.create({ 
      ...body, 
      campId: body.campId || currentUser.campId || 101 
    });
    const data = await this.dutyRepo.save(newDuty);
    return { success: true, data };
  }

  async update(id: number, body: any, currentUser: any) {
    const existing = await this.dutyRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('未找到记录');

    if (!isSuperAdmin(currentUser.role)) {
      if (dayjs(existing.date).isBefore(dayjs(), 'day')) {
        throw new ForbiddenException('不能修改过时排班');
      }
      if (currentUser.role === '教练管理' && existing.type !== 'training') {
        throw new ForbiddenException('无权操作此类型排班');
      }
      if (currentUser.role === '后勤管理' && existing.type !== 'meal') {
        throw new ForbiddenException('无权操作此类型排班');
      }
    }

    await this.dutyRepo.update(id, body);
    const updated = await this.dutyRepo.findOne({ where: { id } });
    return { success: true, data: updated };
  }

  async remove(id: number, currentUser: any) {
    const existing = await this.dutyRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('未找到记录');

    if (!isSuperAdmin(currentUser.role)) {
      if (dayjs(existing.date).isBefore(dayjs(), 'day')) {
        throw new ForbiddenException('不能删除过时排班');
      }
      if (currentUser.role === '教练管理' && existing.type !== 'training') {
        throw new ForbiddenException('无权操作此类型排班');
      }
      if (currentUser.role === '后勤管理' && existing.type !== 'meal') {
        throw new ForbiddenException('无权操作此类型排班');
      }
    }

    await this.dutyRepo.delete(id);
    return { success: true, message: 'Deleted' };
  }

  async batchRecipes(body: any) {
    const { campId, startDate, endDate, patterns } = body;
    if (!campId || !startDate || !endDate || !patterns) {
      throw new BadRequestException('参数不完整');
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    
    // 1. 覆盖逻辑
    await this.dutyRepo.createQueryBuilder()
      .delete()
      .where('camp_id = :campId', { campId })
      .andWhere('type = :type', { type: 'meal' })
      .andWhere('date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .execute();

    // 2. 插入逻辑
    const diffDays = end.diff(start, 'day');
    const dutiesToInsert = [] as Duty[];

    for (let i = 0; i <= diffDays; i++) {
      const current = start.add(i, 'day');
      const currentDateStr = current.format('YYYY-MM-DD');
      let dayOfWeekNum: number = current.day();
      if (dayOfWeekNum === 0) dayOfWeekNum = 7;

      const pattern = patterns.find((p: any) => p.dayOfWeek === dayOfWeekNum);
      if (pattern && pattern.meals) {
        for (const meal of pattern.meals) {
          dutiesToInsert.push(this.dutyRepo.create({
            campId,
            date: currentDateStr,
            timeSlot: meal.timeSlot,
            location: meal.location,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            remark: meal.remark,
            type: 'meal',
            mealType: meal.mealType,
            status: 'scheduled',
          }));
        }
      }
    }

    if (dutiesToInsert.length > 0) {
      await this.dutyRepo.save(dutiesToInsert);
    }

    return { success: true, message: 'Batch recipes created' };
  }

  async batchSchedules(body: any) {
    const { campId, startDate, endDate, patterns } = body;
    if (!campId || !startDate || !endDate || !patterns) {
      throw new BadRequestException('参数不完整');
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    
    await this.dutyRepo.createQueryBuilder()
      .delete()
      .where('camp_id = :campId', { campId })
      .andWhere('type IN (:...types)', { types: ['training', 'duty'] })
      .andWhere('date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .execute();

    const diffDays = end.diff(start, 'day');
    const dutiesToInsert = [] as Duty[];

    for (let i = 0; i <= diffDays; i++) {
      const current = start.add(i, 'day');
      const currentDateStr = current.format('YYYY-MM-DD');
      let dayOfWeekNum: number = current.day();
      if (dayOfWeekNum === 0) dayOfWeekNum = 7;

      const pattern = patterns.find((p: any) => p.dayOfWeek === dayOfWeekNum);
      if (pattern && pattern.items) {
        for (const item of pattern.items) {
          dutiesToInsert.push(this.dutyRepo.create({
            campId,
            date: currentDateStr,
            timeSlot: item.timeSlot,
            location: item.location || '',
            courseId: item.courseId,
            type: item.type,
            mealType: item.mealType,
            coachIds: item.coachIds || [],
            coach: item.coach || '',
            remark: item.remark || '',
            status: 'scheduled',
          }));
        }
      }
    }

    if (dutiesToInsert.length > 0) {
      await this.dutyRepo.save(dutiesToInsert);
    }

    return { success: true, message: 'Batch schedules created' };
  }
}
