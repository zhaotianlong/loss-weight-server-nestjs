import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentService } from '../student.service';
import { Student } from '../student.entity';
import { Bed } from '../../camp/entities/bed.entity';
import { StudentCheckin } from '../../student-health/entities/student-checkin.entity';
import { StuBodyData } from '../../student-health/entities/stu-body-data.entity';
import { Tuition } from '../../logistics/entities/tuition.entity';
import { CoachStudentRelation } from '../../coach/entities/coach-student-relation.entity';
import { StuClassRecord } from '../../private-purchase/entities/stu-class-record.entity';
import { Repository } from 'typeorm';

describe('StudentService', () => {
  let service: StudentService;
  let studentRepo: Repository<Student>;
  let tuitionRepo: Repository<Tuition>;
  let bedRepo: Repository<Bed>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
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
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(StudentCheckin),
          useValue: {},
        },
        {
          provide: getRepositoryToken(StuBodyData),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Tuition),
          useValue: {
            create: jest.fn().mockImplementation(dto => dto),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CoachStudentRelation),
          useValue: {},
        },
        {
          provide: getRepositoryToken(StuClassRecord),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    studentRepo = module.get<Repository<Student>>(getRepositoryToken(Student));
    tuitionRepo = module.get<Repository<Tuition>>(getRepositoryToken(Tuition));
    bedRepo = module.get<Repository<Bed>>(getRepositoryToken(Bed));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyRenew', () => {
    it('should create a pending tuition record and lock the bed', async () => {
      const stuId = 1;
      const student = { stuId, name: 'Test Student', campId: 101, bedId: 501 };
      jest.spyOn(studentRepo, 'findOne').mockResolvedValue(student as any);

      const result = await service.applyRenew({
        stuId,
        days: 30,
        actualAmount: 5000,
        salespersonId: 'emp001'
      });

      expect(tuitionRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        stuId,
        source: '学费(续住)',
        amount: 5000,
        status: '3', // Pending
      }));
      expect(tuitionRepo.save).toHaveBeenCalled();
      expect(bedRepo.update).toHaveBeenCalledWith(501, { status: 2 }); // Locked
      expect(result.success).toBe(true);
    });
  });
});
