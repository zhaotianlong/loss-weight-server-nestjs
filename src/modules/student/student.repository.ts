import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repository: Repository<Student>,
  ) {}

  async create(data: Partial<Student>): Promise<Student> {
    const student = this.repository.create(data);
    return this.repository.save(student);
  }

  async findByStuId(stuId: number): Promise<Student | null> {
    return this.repository.findOne({ where: { stuId } });
  }

  async findById(id: number): Promise<Student | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(stuId: number, data: Partial<Student>): Promise<void> {
    await this.repository.update({ stuId }, data);
  }
}
