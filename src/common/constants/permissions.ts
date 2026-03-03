/**
 * 权限常量定义
 */

// 角色类型
export enum UserRole {
  SUPER_ADMIN = '超级管理员',
  CAMP_ADMIN = '营地管理员',
  LOGISTICS_ADMIN = '后勤管理',
  COACH_ADMIN = '教练管理',
}

// 权限标识
export enum Permission {
  // 仪表板
  DASHBOARD_VIEW = 'dashboard:view',
  
  // 营地管理
  CAMP_VIEW = 'camp:view',
  CAMP_CREATE = 'camp:create',
  CAMP_EDIT = 'camp:edit',
  CAMP_DELETE = 'camp:delete',
  CAMP_SCHEDULE_VIEW = 'camp:schedule:view',
  CAMP_FACILITY_VIEW = 'camp:facility:view',
  CAMP_FACILITY_CREATE = 'camp:facility:create',
  CAMP_FACILITY_EDIT = 'camp:facility:edit',
  CAMP_FACILITY_DELETE = 'camp:facility:delete',
  
  // 房间管理
  ROOM_VIEW = 'room:view',
  ROOM_CREATE = 'room:create',
  ROOM_EDIT = 'room:edit',
  ROOM_DELETE = 'room:delete',
  
  // 员工管理
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_EDIT = 'user:edit',
  USER_DELETE = 'user:delete',
  
  // 学员管理
  STUDENT_VIEW = 'student:view',
  STUDENT_CREATE = 'student:create',
  STUDENT_EDIT = 'student:edit',
  STUDENT_DELETE = 'student:delete',
  
  // 教学管理
  COURSE_VIEW = 'course:view',
  COURSE_CREATE = 'course:create',
  COURSE_EDIT = 'course:edit',
  COURSE_DELETE = 'course:delete',
  
  // 后勤管理
  LOGISTICS_VIEW = 'logistics:view',
  RECIPE_VIEW = 'recipe:view',
  RECIPE_CREATE = 'recipe:create',
  RECIPE_EDIT = 'recipe:edit',
  RECIPE_DELETE = 'recipe:delete',
  FINANCE_VIEW = 'finance:view',
  FINANCE_EDIT = 'finance:edit',
  SALARY_VIEW = 'salary:view',
  SALARY_EDIT = 'salary:edit',
}

// 角色权限映射
export const rolePermissions: Record<string, Permission[]> = {
  // 超级管理员：所有页面可见
  [UserRole.SUPER_ADMIN]: [
    Permission.DASHBOARD_VIEW,
    Permission.CAMP_VIEW,
    Permission.CAMP_CREATE,
    Permission.CAMP_EDIT,
    Permission.CAMP_DELETE,
    Permission.CAMP_SCHEDULE_VIEW,
    Permission.CAMP_FACILITY_VIEW,
    Permission.CAMP_FACILITY_CREATE,
    Permission.CAMP_FACILITY_EDIT,
    Permission.CAMP_FACILITY_DELETE,
    Permission.ROOM_VIEW,
    Permission.ROOM_CREATE,
    Permission.ROOM_EDIT,
    Permission.ROOM_DELETE,
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_EDIT,
    Permission.USER_DELETE,
    Permission.STUDENT_VIEW,
    Permission.STUDENT_CREATE,
    Permission.STUDENT_EDIT,
    Permission.STUDENT_DELETE,
    Permission.COURSE_VIEW,
    Permission.COURSE_CREATE,
    Permission.COURSE_EDIT,
    Permission.COURSE_DELETE,
    Permission.LOGISTICS_VIEW,
    Permission.RECIPE_VIEW,
    Permission.RECIPE_CREATE,
    Permission.RECIPE_EDIT,
    Permission.RECIPE_DELETE,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_EDIT,
    Permission.SALARY_VIEW,
    Permission.SALARY_EDIT,
  ],
  // 营地管理员：不能访问营地管理页面、房型管理页面，其他页面都可以访问
  [UserRole.CAMP_ADMIN]: [
    Permission.DASHBOARD_VIEW,
    Permission.CAMP_FACILITY_VIEW,
    Permission.CAMP_FACILITY_CREATE,
    Permission.CAMP_FACILITY_EDIT,
    Permission.CAMP_FACILITY_DELETE,
    Permission.ROOM_VIEW,
    Permission.USER_VIEW,
    Permission.USER_CREATE,
    Permission.USER_EDIT,
    Permission.USER_DELETE,
    Permission.STUDENT_VIEW,
    Permission.STUDENT_CREATE,
    Permission.STUDENT_EDIT,
    Permission.STUDENT_DELETE,
    Permission.COURSE_VIEW,
    Permission.COURSE_CREATE,
    Permission.COURSE_EDIT,
    Permission.COURSE_DELETE,
    Permission.LOGISTICS_VIEW,
    Permission.RECIPE_VIEW,
    Permission.RECIPE_CREATE,
    Permission.RECIPE_EDIT,
    Permission.RECIPE_DELETE,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_EDIT,
    Permission.SALARY_VIEW,
    Permission.SALARY_EDIT,
  ],
  // 后勤管理：只可见首页、后勤管理页面
  [UserRole.LOGISTICS_ADMIN]: [
    Permission.DASHBOARD_VIEW,
    Permission.LOGISTICS_VIEW,
    Permission.RECIPE_VIEW,
    Permission.RECIPE_CREATE,
    Permission.RECIPE_EDIT,
    Permission.RECIPE_DELETE,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_EDIT,
    Permission.SALARY_VIEW,
    Permission.SALARY_EDIT,
  ],
  // 教练管理：只可见首页、教练管理页面
  [UserRole.COACH_ADMIN]: [
    Permission.DASHBOARD_VIEW,
    Permission.USER_VIEW,
    Permission.COURSE_VIEW,
    Permission.COURSE_CREATE,
    Permission.COURSE_EDIT,
    Permission.COURSE_DELETE,
  ],
};

/**
 * 检查用户是否有指定权限
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
  // 角色名称映射（兼容新旧名称）
  const roleMap: Record<string, string> = {
    '超级管理员': UserRole.SUPER_ADMIN,
    '营地管理员': UserRole.CAMP_ADMIN,
    '后勤管理员': UserRole.LOGISTICS_ADMIN,
    '后勤管理': UserRole.LOGISTICS_ADMIN, // 兼容旧名称
    '教练管理员': UserRole.COACH_ADMIN,
    '教练管理': UserRole.COACH_ADMIN, // 兼容旧名称
  };
  
  const mappedRole = roleMap[userRole] || userRole;
  const permissions = rolePermissions[mappedRole] || [];
  return permissions.includes(permission);
}

/**
 * 检查用户是否有任一权限
 */
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some((perm) => hasPermission(userRole, perm));
}

/**
 * 检查用户是否有所有权限
 */
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every((perm) => hasPermission(userRole, perm));
}

/**
 * 检查用户是否是超级管理员
 */
export function isSuperAdmin(userRole: string): boolean {
  return userRole === UserRole.SUPER_ADMIN || userRole === '超级管理员';
}

/**
 * 检查用户是否有页面访问权限
 */
export function canAccessPage(userRole: string, pagePath: string): boolean {
  // 超级管理员可以访问所有页面
  if (isSuperAdmin(userRole)) {
    return true;
  }

  // 根据路径判断需要的权限
  const pagePermissionMap: Record<string, Permission[]> = {
    '/': [Permission.DASHBOARD_VIEW],
    '/camp-manage': [Permission.CAMP_VIEW],
    '/camp-manage/facility': [Permission.CAMP_FACILITY_VIEW],
    '/camp-manage/schedule': [Permission.CAMP_SCHEDULE_VIEW],
    '/room-manage/room-list': [Permission.ROOM_VIEW],
    '/room-manage/room-type': [Permission.ROOM_VIEW], // 房型管理需要房间查看权限
    '/user': [Permission.USER_VIEW],
    '/coach/manage': [Permission.USER_VIEW],
    '/student': [Permission.STUDENT_VIEW],
    '/coach': [Permission.COURSE_VIEW],
    '/coach/private': [Permission.COURSE_VIEW],
    '/coach/public': [Permission.COURSE_VIEW],
    '/coach/duty': [Permission.COURSE_VIEW],
    '/coach/performance': [Permission.COURSE_VIEW],
    '/logistics': [Permission.LOGISTICS_VIEW],
    '/logistics/recipe': [Permission.RECIPE_VIEW],
    '/logistics/finance': [Permission.FINANCE_VIEW],
    '/logistics/salary': [Permission.SALARY_VIEW],
  };

  // 营地管理员不能访问营地管理和房型管理页面（兼容新旧名称）
  if (userRole === UserRole.CAMP_ADMIN || userRole === '营地管理员') {
    if (pagePath === '/camp-manage' || pagePath === '/room-manage/room-type') {
      return false;
    }
  }

  // 后勤管理员只能访问首页和后勤管理页面（兼容新旧名称）
  if (userRole === UserRole.LOGISTICS_ADMIN || userRole === '后勤管理员' || userRole === '后勤管理') {
    const allowedPaths = ['/', '/logistics', '/logistics/recipe', '/logistics/finance'];
    if (!allowedPaths.includes(pagePath) && !pagePath.startsWith('/logistics/')) {
      return false;
    }
  }

  // 教练管理员只能访问首页和教练管理页面（兼容新旧名称）
  if (userRole === UserRole.COACH_ADMIN || userRole === '教练管理员' || userRole === '教练管理') {
    const allowedPaths = ['/', '/coach', '/coach/manage', '/coach/private', '/coach/public', '/coach/duty'];
    if (!allowedPaths.includes(pagePath) && !pagePath.startsWith('/coach/')) {
      return false;
    }
  }

  // 检查权限
  const requiredPermissions = pagePermissionMap[pagePath];
  if (requiredPermissions && requiredPermissions.length > 0) {
    return hasAnyPermission(userRole, requiredPermissions);
  }

  // 默认允许访问（如个人中心等页面）
  return true;
}


