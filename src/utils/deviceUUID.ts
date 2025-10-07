/**
 * 设备UUID管理工具
 * 使用 FingerprintJS 生成设备唯一标识符，用于设备绑定
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';

const DEVICE_UUID_KEY = 'device_uuid';

// FingerprintJS 实例缓存
let fpPromise: Promise<any> | null = null;

/**
 * 初始化 FingerprintJS
 */
function initFingerprint() {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  return fpPromise;
}

/**
 * 使用 FingerprintJS 生成设备指纹ID
 */
async function generateFingerprintUUID(): Promise<string> {
  try {
    const fp = await initFingerprint();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    // 降级方案：使用随机UUID
    return generateFallbackUUID();
  }
}

/**
 * 降级方案：生成随机UUID
 */
function generateFallbackUUID(): string {
  // 使用crypto API生成安全的随机UUID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // 降级方案：使用Math.random()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 获取或生成设备UUID
 * 优先使用 FingerprintJS 生成设备指纹，如果localStorage中已存在则直接返回
 */
export async function getDeviceUUID(): Promise<string> {
  try {
    // 尝试从localStorage获取现有的UUID
    let uuid = localStorage.getItem(DEVICE_UUID_KEY);
    
    if (!uuid) {
      // 如果不存在，使用 FingerprintJS 生成新的设备指纹ID
      uuid = await generateFingerprintUUID();
      localStorage.setItem(DEVICE_UUID_KEY, uuid);
      console.log('Generated new device fingerprint UUID:', uuid);
    }
    
    return uuid;
  } catch (error) {
    console.error('Error getting device UUID:', error);
    // 如果localStorage不可用，生成一个临时UUID（会话级别）
    return generateFallbackUUID();
  }
}

/**
 * 重置设备UUID（用于测试或特殊场景）
 * 会重新使用 FingerprintJS 生成新的设备指纹
 */
export async function resetDeviceUUID(): Promise<string> {
  try {
    const newUUID = await generateFingerprintUUID();
    localStorage.setItem(DEVICE_UUID_KEY, newUUID);
    console.log('Reset device UUID:', newUUID);
    return newUUID;
  } catch (error) {
    console.error('Error resetting device UUID:', error);
    return generateFallbackUUID();
  }
}

/**
 * 获取当前存储的UUID（不生成新的）
 */
export function getCurrentDeviceUUID(): string | null {
  try {
    return localStorage.getItem(DEVICE_UUID_KEY);
  } catch (error) {
    console.error('Error getting current device UUID:', error);
    return null;
  }
}

/**
 * 强制重新生成设备指纹并更新存储
 */
export async function forceRegenerateFingerprint(): Promise<string> {
  try {
    // 清除缓存的FingerprintJS实例
    fpPromise = null;
    const newUUID = await generateFingerprintUUID();
    localStorage.setItem(DEVICE_UUID_KEY, newUUID);
    console.log('Force regenerated device fingerprint:', newUUID);
    return newUUID;
  } catch (error) {
    console.error('Error force regenerating fingerprint:', error);
    return generateFallbackUUID();
  }
}

