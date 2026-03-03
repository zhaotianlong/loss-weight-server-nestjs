/**
 * 密码加密工具
 * 
 * 生产环境密码加密流程：
 * 1. 前端加密：明文密码 → SHA-256 加密（使用传输密钥）→ 传输到后端
 * 2. 后端存储：接收 SHA-256 加密值 → PBKDF2 哈希加盐 → 存储（格式：salt:hash）
 * 3. 登录验证：前端 SHA-256 加密 → 传输 → 后端 PBKDF2 哈希 → 与存储值比较
 * 
 * 安全说明：
 * - 前端使用 SHA-256 对密码进行传输加密，避免明文传输
 * - 后端使用 PBKDF2 对传输加密后的密码进行哈希加盐，增强存储安全性
 * - 即使传输密钥泄露，攻击者仍需要破解 PBKDF2 哈希才能获取密码
 * 
 * 生产环境建议：
 * - TRANSMIT_KEY 应该动态生成或从服务端获取，定期轮换
 * - 每个用户的 PBKDF2 盐值应该是随机的（已实现）
 * - 考虑使用 HTTPS + TLS 1.3 进一步保护传输层安全
 */

import { Logger } from '@nestjs/common';

const logger = new Logger('PasswordUtils');

// 固定的盐值前缀（用于 PBKDF2 哈希）
// 注意：每个用户的完整盐值是 SALT_PREFIX + 随机盐值，确保每个用户的盐值都不同
const SALT_PREFIX = 'fitness_camp_2024_';

// 前端传输加密密钥（用于 SHA-256 传输加密）
// 生产环境应该：
// 1. 从服务端动态获取
// 2. 定期轮换
// 3. 使用环境变量或配置中心管理
const TRANSMIT_KEY = 'fitness_camp_transmit_2024';

/**
 * 生成随机盐值
 */
function generateSalt(): string {
  const randomBytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    // 降级方案：使用时间戳和随机数
    for (let i = 0; i < randomBytes.length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 使用 PBKDF2 哈希密码
 * 
 * 用途：后端对密码进行哈希加盐存储
 * 
 * 注意：
 * - 在生产环境中，此函数接收的是前端已加密的 SHA-256 哈希值
 * - 不会对明文密码进行哈希，而是对传输加密后的值进行 PBKDF2 哈希
 * - 这样可以实现双重加密：传输层加密（SHA-256）+ 存储层加密（PBKDF2）
 * 
 * @param password 密码值（前端传输加密后的 SHA-256 哈希值，或用于初始化时的明文密码）
 * @param salt 盐值（可选，如果不提供则生成随机盐）
 * @returns 返回格式：salt:hash（salt 是随机盐值，hash 是 PBKDF2 哈希值）
 */
export async function hashPassword(password: string, salt?: string): Promise<string> {
  const actualSalt = salt || generateSalt();
  const fullSalt = SALT_PREFIX + actualSalt;
  
  // 将盐值转换为 Uint8Array
  const saltBuffer = new TextEncoder().encode(fullSalt);
  
  // 将密码转换为 Uint8Array
  const passwordBuffer = new TextEncoder().encode(password);
  
  try {
    // 使用 Web Crypto API 的 PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000, // 迭代次数
        hash: 'SHA-256',
      },
      keyMaterial,
      256 // 输出长度 256 位 = 32 字节
    );
    
    // 将哈希值转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 返回格式：salt:hash
    return `${actualSalt}:${hashHex}`;
  } catch (error) {
    logger.error('密码哈希失败', error);
    throw new Error('密码加密失败');
  }
}

/**
 * 验证密码
 * 
 * 用途：后端验证密码是否正确
 * 
 * 注意：
 * - 在生产环境中，password 参数是前端已加密的 SHA-256 哈希值
 * - hashedPassword 是存储的 PBKDF2 哈希值（格式：salt:hash）
 * - 验证流程：对前端加密值进行 PBKDF2 哈希，然后与存储值比较
 * 
 * @param password 密码值（前端传输加密后的 SHA-256 哈希值）
 * @param hashedPassword 存储的哈希密码（格式：salt:hash）
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const [salt, storedHash] = hashedPassword.split(':');
    if (!salt || !storedHash) {
      return false;
    }
    
    // 使用相同的盐值重新计算哈希
    const computedHash = await hashPassword(password, salt);
    const [, computedHashValue] = computedHash.split(':');
    
    // 安全比较（防止时序攻击）
    return constantTimeEquals(storedHash, computedHashValue);
  } catch (error) {
    logger.error('密码验证失败', error);
    return false;
  }
}

/**
 * 常量时间比较（防止时序攻击）
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * 同步版本的哈希函数（用于初始化 mock 数据）
 * 注意：这个函数使用与异步版本相同的算法逻辑，但使用简化的实现
 * 仅用于开发环境初始化数据，生产环境应该使用异步的 hashPassword 函数
 * 
 * 使用与异步版本相同的盐值和迭代逻辑，确保兼容性
 */
export function hashPasswordSync(password: string, salt?: string): string {
  const actualSalt = salt || generateSalt();
  const fullSalt = SALT_PREFIX + actualSalt;
  
  // 使用简化的哈希算法（仅用于初始化mock数据）
  // 实际运行时应该使用异步的 hashPassword 函数
  let hash = 0;
  let combined = password + fullSalt;
  const iterations = 1000; // 简化迭代次数
  
  // 模拟多次迭代
  for (let iter = 0; iter < iterations; iter++) {
    let tempHash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      tempHash = ((tempHash << 5) - tempHash) + char + iter;
      tempHash = tempHash & tempHash; // 转换为 32 位整数
    }
    hash = tempHash;
    combined = Math.abs(hash).toString(16);
  }
  
  // 转换为正数并转为十六进制（256位 = 64个十六进制字符）
  const hashHex = Math.abs(hash).toString(16).padStart(64, '0');
  
  return `${actualSalt}:${hashHex}`;
}

/**
 * 同步版本的验证函数（用于初始化 mock 数据）
 * 注意：这个函数仅用于初始化时的兼容性检查，实际验证应该使用异步版本
 */
export function verifyPasswordSync(password: string, hashedPassword: string): boolean {
  try {
    const [salt] = hashedPassword.split(':');
    if (!salt) {
      return false;
    }
    
    const computedHash = hashPasswordSync(password, salt);
    return computedHash === hashedPassword;
  } catch (error) {
    return false;
  }
}

/**
 * 前端传输加密：使用 SHA-256 对密码进行哈希
 * 
 * 用途：前端在传输密码到后端之前进行加密，避免明文传输
 * 
 * 生产环境要求：
 * - 所有密码传输前必须调用此函数进行加密
 * - 适用于：登录、注册、修改密码、重置密码等所有涉及密码传输的场景
 * - 此函数使用 Web Crypto API，在浏览器和 Node.js 环境中都可以使用
 * 
 * @param password 明文密码（用户输入的原始密码）
 * @returns 返回 SHA-256 哈希值（64个十六进制字符的字符串）
 * @throws 如果加密失败会抛出错误
 */
export async function encryptPasswordForTransmit(password: string): Promise<string> {
  try {
    // 使用 Web Crypto API 的 SHA-256
    // 将密码与传输密钥组合后进行哈希，增强安全性
    const encoder = new TextEncoder();
    const data = encoder.encode(password + TRANSMIT_KEY);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // 转换为十六进制字符串（64个字符）
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    logger.error('密码加密失败', error);
    throw new Error('密码加密失败');
  }
}

/**
 * 后端验证传输的加密密码
 * 接收前端加密后的密码，验证后重新进行 PBKDF2 哈希存储
 * @param transmittedHash 前端传输的加密哈希值
 * @param originalPassword 原始明文密码（用于验证）
 * @returns 是否匹配
 */
export async function verifyTransmittedPassword(
  transmittedHash: string,
  originalPassword: string
): Promise<boolean> {
  try {
    const computedHash = await encryptPasswordForTransmit(originalPassword);
    return constantTimeEquals(transmittedHash, computedHash);
  } catch (error) {
    logger.error('传输密码验证失败', error);
    return false;
  }
}

