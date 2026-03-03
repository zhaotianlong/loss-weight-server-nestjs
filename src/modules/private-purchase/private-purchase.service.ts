import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StuPrivateOrder } from './entities/stu-private-order.entity';
import dayjs from 'dayjs';

@Injectable()
export class PrivatePurchaseService {
  constructor(
    @InjectRepository(StuPrivateOrder)
    private orderRepo: Repository<StuPrivateOrder>,
  ) {}

  async findAll(query: any) {
    const { stuId, coachId, courseId, status, page = 1, pageSize = 20 } = query;
    const queryBuilder = this.orderRepo.createQueryBuilder('order');

    if (stuId) queryBuilder.andWhere('order.stuId = :stuId', { stuId: Number(stuId) });
    if (courseId) queryBuilder.andWhere('order.courseId = :courseId', { courseId: Number(courseId) });
    if (status) {
      let statusStr = status;
      if (status === '1') statusStr = '开单';
      if (status === '2') statusStr = '上课中';
      if (status === '3') statusStr = '已完成';
      queryBuilder.andWhere('order.status = :statusStr', { statusStr });
    }

    const [data, total] = await queryBuilder
      .skip((Number(page) - 1) * Number(pageSize))
      .take(Number(pageSize))
      .orderBy('order.orderTime', 'DESC')
      .getManyAndCount();

    return {
      success: true,
      data,
      meta: { page: Number(page), pageSize: Number(pageSize), total, pageCount: Math.ceil(total / Number(pageSize)) },
    };
  }

  async findOne(id: number) {
    const item = await this.orderRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Not found');
    return { success: true, data: item };
  }

  async create(body: any) {
    const newOrder = this.orderRepo.create({
       stuId: Number(body.stuId),
       orderId: `ORD${Date.now()}`,
       courseId: Number(body.courseId),
       courseType: body.courseType || '常规',
       paymentType: body.paymentType || '单节',
       originalPrice: body.totalPrice || 0,
       discountPrice: body.totalPrice || 0,
       totalPrice: body.totalPrice || 0,
       totalSessions: body.quantity || 1,
       usedSessions: 0,
       status: '开单',
       orderTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
       bookingCoach: body.bookingCoach || '系统',
       bookingCoachId: body.bookingCoachId || 'sys',
    });
    const data = await this.orderRepo.save(newOrder);
    return { success: true, data };
  }

  async update(id: number, body: any) {
    await this.orderRepo.update(id, body);
    const updated = await this.orderRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Not found');
    return { success: true, data: updated };
  }

  async remove(id: number) {
    const result = await this.orderRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Not found');
    return { success: true, message: 'Deleted' };
  }
}
