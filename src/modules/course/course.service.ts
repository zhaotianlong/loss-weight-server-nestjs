import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Course } from './entities/course.entity';
import { PrivateCourse } from './entities/private-course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    @InjectRepository(PrivateCourse)
    private privateCourseRepo: Repository<PrivateCourse>,
  ) {}

  async findAll(query: any) {
    const { name, type, status, campId } = query;
    const where: any = {};

    if (name) where.title = Like(`%${name}%`);
    if (type) where.type = type;
    if (campId) where.campId = Number(campId);
    // Assuming status might be added to Course entity if needed, currently not in entity
    
    const data = await this.courseRepo.find({ where, order: { courseId: 'ASC' } });
    return { success: true, data };
  }

  async findAllPrivate(query: any) {
    const { type, status, campId } = query;
    const where: any = {};

    if (type) where.type = Like(`%${type}%`);
    if (status !== undefined) where.status = Number(status);
    if (campId) where.campId = Number(campId);
    
    const data = await this.privateCourseRepo.find({ where, order: { courseId: 'ASC' } });
    return { success: true, data };
  }
}
