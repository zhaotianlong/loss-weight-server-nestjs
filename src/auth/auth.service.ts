import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Employee } from '../modules/user/entities/employee.entity';
import { Camp } from '../modules/camp/entities/camp.entity';
import { verifyPassword } from '../common/utils/password';

@Injectable()
export class AuthService {
  private codeStore = new Map<string, { code: string; expireTime: number }>();

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(Camp)
    private campRepo: Repository<Camp>,
    private readonly jwtService: JwtService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async login(body: any) {
    const { username, phone, password } = body;

    if (!password) {
      throw new BadRequestException('密码不能为空');
    }

    let user: User | null = null;
    if (username) {
      // 允许账号或手机号登录
      user = await this.userRepo.findOne({ 
        where: [
          { empId: username },
          { phone: username }
        ],
        select: ['id', 'phone', 'passwordHash', 'role', 'empId', 'stuId'] 
      });
    } else if (phone) {
      user = await this.userRepo.findOne({ where: { phone }, select: ['id', 'phone', 'passwordHash', 'role', 'empId', 'stuId'] });
    }

    if (!user) {
      throw new UnauthorizedException('账号或手机号不存在');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('密码错误');
    }

    const employee = await this.employeeRepo.findOne({ where: { empId: user.empId! } });
    if (!employee) {
      throw new NotFoundException('员工信息不存在');
    }

    const camp = await this.campRepo.findOne({ where: { campId: employee.campId } });

    const token = this.jwtService.sign({
      sub: user.id,
      empId: employee.empId,
      role: employee.role,
      campId: employee.campId,
    });

    return {
      token,
      user: {
        userId: employee.empId,
        id: employee.empId,
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
        campId: employee.campId,
        campName: camp?.campName,
      },
    };
  }

  async loginByCode(phone: string, code: string) {
    const storedCode = this.codeStore.get(phone);
    if (!storedCode || storedCode.code !== code || Date.now() > storedCode.expireTime) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('该手机号未注册');

    const employee = await this.employeeRepo.findOne({ where: { empId: user.empId! } });
    if (!employee) throw new NotFoundException('员工信息不存在');

    const camp = await this.campRepo.findOne({ where: { campId: employee.campId } });

    const token = this.jwtService.sign({
      sub: user.id,
      empId: employee.empId,
      role: employee.role,
      campId: employee.campId,
    });

    this.codeStore.delete(phone);

    return {
      token,
      user: {
        userId: employee.empId,
        id: employee.empId,
        name: employee.name,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
        campId: employee.campId,
        campName: camp?.campName,
      },
    };
  }

  async sendCode(phone: string) {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('该手机号未注册');

    const code = this.generateCode();
    const expireTime = Date.now() + 5 * 60 * 1000;
    this.codeStore.set(phone, { code, expireTime });

    return { code };
  }

  async refreshToken(user: any) {
    const newToken = this.jwtService.sign({
      sub: user.id,
      empId: user.empId,
      role: user.role,
      campId: user.campId,
    });
    return { token: newToken };
  }

  async getMe(empId: string) {
    const employee = await this.employeeRepo.findOne({ where: { empId } });
    if (!employee) throw new NotFoundException('用户不存在');

    const camp = await this.campRepo.findOne({ where: { campId: employee.campId } });

    return {
      userId: employee.empId,
      id: employee.empId,
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
      status: employee.status,
      campId: employee.campId,
      campName: camp?.campName,
    };
  }
}
