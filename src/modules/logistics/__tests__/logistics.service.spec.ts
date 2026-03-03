import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LogisticsService } from '../logistics.service';
import { Tuition } from '../entities/tuition.entity';
import { Student } from '../../student/student.entity';
import { Bed } from '../../camp/entities/bed.entity';
import { StudentCheckin } from '../../student-health/entities/student-checkin.entity';
import { Recipe } from '../entities/recipe.entity';
import { Renewal } from '../entities/renewal.entity';
import { SalaryRecord } from '../entities/salary-record.entity';
import { CommissionStrategy } from '../entities/commission-strategy.entity';
import { Employee } from '../../user/entities/employee.entity';
import { StuPrivateOrder } from '../../private-purchase/entities/stu-private-order.entity';
import { Repository } from 'typeorm';

describe('LogisticsService', () => {
  let service: LogisticsService;
  let tuitionRepo: Repository<Tuition>;
  let studentRepo: Repository<Student>;
  let bedRepo: Repository<Bed>;
  let checkinRepo: Repository<StudentCheckin>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogisticsService,
        {
          provide: getRepositoryToken(Tuition),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Student),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Bed),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn().mockImplementation(dto => dto),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(StudentCheckin),
          useValue: {
            create: jest.fn().mockImplementation(dto => dto),
            save: jest.fn(),
          },
        },
        { provide: getRepositoryToken(Recipe), useValue: {} },
        { provide: getRepositoryToken(Renewal), useValue: {} },
        { provide: getRepositoryToken(SalaryRecord), useValue: {} },
        { provide: getRepositoryToken(CommissionStrategy), useValue: {} },
        { provide: getRepositoryToken(Employee), useValue: {} },
        { provide: getRepositoryToken(StuPrivateOrder), useValue: {} },
      ],
    }).compile();

    service = module.get<LogisticsService>(LogisticsService);
    tuitionRepo = module.get<Repository<Tuition>>(getRepositoryToken(Tuition));
    studentRepo = module.get<Repository<Student>>(getRepositoryToken(Student));
    bedRepo = module.get<Repository<Bed>>(getRepositoryToken(Bed));
    checkinRepo = module.get<Repository<StudentCheckin>>(getRepositoryToken(StudentCheckin));
  });

  describe('approveTuition - checkin', () => {
    it('should finalize checkin when tuition is approved', async () => {
      const tuition = {
        id: 1,
        status: '3',
        campId: 101,
        applyInfo: {
          type: 'checkin',
          bedId: 0,
          bedNum: '101-1',
          roomId: 1,
          stuId: 1,
          checkinDate: '2024-02-14'
        }
      };
      jest.spyOn(tuitionRepo, 'findOne').mockResolvedValue(tuition as any);
      jest.spyOn(studentRepo, 'findOne').mockResolvedValue({ stuId: 1, name: 'Test' } as any);
      jest.spyOn(bedRepo, 'findOne').mockResolvedValue({ bedId: 100 } as any);

      const result = await service.approveTuition(1);

      expect(tuitionRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: '1' }));
      expect(bedRepo.update).toHaveBeenCalledWith(100, { stuId: 1, status: 1 });
      expect(studentRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: 1, bedId: 100 }));
      expect(checkinRepo.save).toHaveBeenCalled();
      expect(result.message).toBe('审核通过');
    });
  });
});
