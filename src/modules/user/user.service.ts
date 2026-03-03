import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { User } from '../../auth/entities/user.entity';
import { isSuperAdmin } from '../../common/constants/permissions';
import { hashPassword, verifyPassword, encryptPasswordForTransmit } from '../../common/utils/password';

@Injectable()
export class UserService {
  private ADMIN_ROLES = ['超级管理员', '营地管理员', '后勤管理员', '教练管理员', '招生管理员'];

  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(query: any, currentUser: any) {
    const { campId, name, phone, role, status, page = 1, pageSize = 20 } = query;
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
    if (phone) where.phone = Like(`%${phone}%`);
    if (role) where.role = role;
    if (status !== undefined) where.status = Number(status);

    const [employees, total] = await this.employeeRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      order: { empId: 'ASC' },
    });

    const data = employees.map((emp: any) => ({
      userId: emp.empId, id: emp.empId, name: emp.name, phone: emp.phone, email: emp.email,
      role: emp.role, status: emp.status, avatar: emp.avatar, idNumber: emp.idNumber,
      address: emp.address, attachments: emp.attachments || [], baseSalary: emp.baseSalary || 0,
      allowCommission: emp.allowCommission ?? false, campId: emp.campId,
      createTime: emp.createTime, updateTime: emp.updateTime,
    }));

    return {
      success: true,
      data,
      meta: { page: Number(page), pageSize: Number(pageSize), total, pageCount: Math.ceil(total / Number(pageSize)) },
    };
  }

  async findOne(id: string) {
    const emp = await this.employeeRepo.findOne({ where: { empId: id } });
    if (!emp) throw new NotFoundException('Not found');
    return {
      success: true,
      data: {
        userId: emp.empId, id: emp.empId, name: emp.name, phone: emp.phone,
        email: (emp as any).email || `${emp.empId}@camp.com`, role: emp.role, status: emp.status,
        avatar: (emp as any).avatar, idNumber: (emp as any).idNumber, address: (emp as any).address,
        attachments: (emp as any).attachments || [], baseSalary: emp.baseSalary || 0,
        allowCommission: emp.allowCommission ?? false, campId: emp.campId,
        createTime: emp.createTime, updateTime: (emp as any).updateTime,
      },
    };
  }

  async create(body: any, currentUser: any) {
    if (body.role && this.ADMIN_ROLES.includes(body.role)) {
      if (!isSuperAdmin(currentUser.role)) {
        throw new ForbiddenException('只有超级管理员可以创建管理员角色');
      }
    }

    let finalCampId = body.campId;
    if (!isSuperAdmin(currentUser.role)) {
      finalCampId = currentUser.campId || 101;
    } else {
      finalCampId = body.campId || 101;
    }

    const newId = `emp${Date.now()}`;
    const newEmployee = this.employeeRepo.create({
      ...body,
      empId: newId,
      campId: finalCampId,
      hireDate: new Date().toISOString().split('T')[0],
    });
    await this.employeeRepo.save(newEmployee);

    if (this.ADMIN_ROLES.includes(body.role)) {
      let passwordToHash = body.password;
      if (!passwordToHash) passwordToHash = await encryptPasswordForTransmit('admin123');
      const hashedPassword = await hashPassword(passwordToHash);
      
      const newUser = this.userRepo.create({
        phone: body.phone,
        passwordHash: hashedPassword,
        role: body.role,
        empId: newId,
      });
      await this.userRepo.save(newUser);
    }

    return { success: true, data: { ...newEmployee, id: newId, userId: newId } };
  }

  async update(id: string, body: any, currentUser: any) {
    const existingEmp = await this.employeeRepo.findOne({ where: { empId: id } });
    if (!existingEmp) throw new NotFoundException('Not found');

    if (body.role && this.ADMIN_ROLES.includes(body.role)) {
      if (!isSuperAdmin(currentUser.role)) {
        if (this.ADMIN_ROLES.includes(existingEmp.role)) {
          throw new ForbiddenException('只有超级管理员可以修改管理员角色');
        }
      }
    }

    await this.employeeRepo.update({ empId: id }, body);
    const updated = await this.employeeRepo.findOne({ where: { empId: id } });

    if (body.role && this.ADMIN_ROLES.includes(body.role)) {
      let user = await this.userRepo.findOne({ where: { empId: id } });
      if (user) {
        if (body.password) {
          user.passwordHash = await hashPassword(body.password);
        }
        user.role = body.role;
        user.phone = body.phone || user.phone;
        await this.userRepo.save(user);
      } else {
        const defaultEncrypted = await encryptPasswordForTransmit('admin123');
        const hashedPassword = await hashPassword(body.password || defaultEncrypted);
        const newUser = this.userRepo.create({
          phone: body.phone || existingEmp.phone,
          passwordHash: hashedPassword,
          role: body.role,
          empId: id,
        });
        await this.userRepo.save(newUser);
      }
    } else if (body.role) {
      await this.userRepo.delete({ empId: id });
    }

    return { success: true, data: { ...updated, id, userId: id } };
  }

  async remove(id: string) {
    await this.userRepo.delete({ empId: id });
    const result = await this.employeeRepo.delete({ empId: id });
    if (result.affected === 0) throw new NotFoundException('Not found');
    return { success: true, message: 'Deleted' };
  }

  async changePassword(id: string, body: any) {
    const { oldPassword, newPassword } = body;
    if (!oldPassword || !newPassword) throw new BadRequestException('原密码和新密码不能为空');

    const user = await this.userRepo.findOne({ where: { empId: id }, select: ['id', 'passwordHash'] });
    if (!user) throw new NotFoundException('用户账号不存在');

    const isOldPasswordValid = await verifyPassword(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) throw new BadRequestException('原密码错误');

    user.passwordHash = await hashPassword(newPassword);
    await this.userRepo.save(user);

    return { success: true, message: '密码修改成功' };
  }

  async resetPassword(id: string, body: any, currentUser: any) {
    const { newPassword } = body;
    if (!newPassword) throw new BadRequestException('新密码不能为空');

    const targetEmp = await this.employeeRepo.findOne({ where: { empId: id } });
    if (!targetEmp) throw new NotFoundException('用户不存在');

    if (!this.ADMIN_ROLES.includes(targetEmp.role)) {
      throw new ForbiddenException('只能重置管理员角色的密码');
    }

    if (!isSuperAdmin(currentUser.role)) {
      if (currentUser.role === '营地管理员') {
        if (currentUser.campId !== targetEmp.campId) throw new ForbiddenException('只能重置自己营地的人员密码');
      } else if (currentUser.empId !== id) {
        throw new ForbiddenException('只能重置自己的密码');
      }
    }

    const user = await this.userRepo.findOne({ where: { empId: id } });
    if (!user) throw new NotFoundException('该用户账号不存在');

    user.passwordHash = await hashPassword(newPassword);
    await this.userRepo.save(user);

    return { success: true, message: '密码重置成功，该用户需要重新登录', data: { tokenExpired: true } };
  }

  async uploadAvatar(id: string) {
    const emp = await this.employeeRepo.findOne({ where: { empId: id } });
    if (!emp) throw new NotFoundException('用户不存在');
    const avatarUrl = `https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg?t=${Date.now()}`;
    await this.employeeRepo.update({ empId: id }, { avatar: avatarUrl } as any);
    return { success: true, data: avatarUrl, message: '头像上传成功' };
  }
}
