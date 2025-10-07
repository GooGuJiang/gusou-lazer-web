/**
 * 设备UUID管理工具
 * 用于生成和存储设备唯一标识符，用于设备绑定
 */

const DEVICE_UUID_KEY = 'device_uuid';

/**
 * 生成UUID v4
 */
function generateUUID(): string {
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
 * 如果本地存储中没有UUID，则生成一个新的并保存
 */
export function getDeviceUUID(): string {
  try {
    // 尝试从localStorage获取现有的UUID
    let uuid = localStorage.getItem(DEVICE_UUID_KEY);
    
    if (!uuid) {
      // 如果不存在，生成新的UUID
      uuid = generateUUID();
      localStorage.setItem(DEVICE_UUID_KEY, uuid);
      console.log('Generated new device UUID:', uuid);
    }
    
    return uuid;
  } catch (error) {
    console.error('Error getting device UUID:', error);
    // 如果localStorage不可用，生成一个临时UUID（会话级别）
    return generateUUID();
  }
}

/**
 * 重置设备UUID（用于测试或特殊场景）
 */
export function resetDeviceUUID(): string {
  try {
    const newUUID = generateUUID();
    localStorage.setItem(DEVICE_UUID_KEY, newUUID);
    console.log('Reset device UUID:', newUUID);
    return newUUID;
  } catch (error) {
    console.error('Error resetting device UUID:', error);
    return generateUUID();
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

