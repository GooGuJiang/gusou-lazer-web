import { chatAPI, userAPI } from './api';
import type { ChatChannel, ChatMessage, User } from '../types';

// API缓存管理器
class APICache {
  private userCache = new Map<number, { data: User; timestamp: number }>();
  private channelMessagesCache = new Map<number, { data: ChatMessage[]; timestamp: number }>();
  private channelListCache: { data: ChatChannel[]; timestamp: number } | null = null;
  private pendingRequests = new Map<string, Promise<unknown>>();
  
  private readonly USER_CACHE_DURATION = 5 * 60 * 1000; // 5分钟
  private readonly CHANNEL_MESSAGES_CACHE_DURATION = 2 * 60 * 1000; // 2分钟
  private readonly CHANNEL_LIST_CACHE_DURATION = 30 * 1000; // 30秒
  
  // 获取用户信息（带缓存）
  async getUser(userId: number): Promise<User | null> {
    const cacheKey = `user-${userId}`;
    
    // 检查缓存
    const cached = this.userCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.USER_CACHE_DURATION) {
      return cached.data;
    }
    
    // 检查是否有正在进行的请求
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<User | null>;
    }
    
    try {
      const promise = userAPI.getUser(userId);
      this.pendingRequests.set(cacheKey, promise);
      
      const userData = await promise;
      
      // 缓存结果
      this.userCache.set(userId, {
        data: userData,
        timestamp: Date.now()
      });
      
      return userData;
    } catch (error) {
      console.error(`获取用户 ${userId} 信息失败:`, error);
      return null;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  // 批量获取用户信息
  async getUsers(userIds: number[]): Promise<Map<number, User>> {
    const results = new Map<number, User>();
    const toFetch: number[] = [];
    
    // 检查缓存，收集需要获取的用户ID
    userIds.forEach(userId => {
      const cached = this.userCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.USER_CACHE_DURATION) {
        results.set(userId, cached.data);
      } else {
        toFetch.push(userId);
      }
    });
    
    // 批量请求未缓存的用户信息（限制并发数）
    if (toFetch.length > 0) {
      const batchSize = 5;
      const promises: Promise<void>[] = [];
      
      for (let i = 0; i < toFetch.length; i += batchSize) {
        const batch = toFetch.slice(i, i + batchSize);
        const batchPromise = Promise.allSettled(
          batch.map(async userId => {
            const user = await this.getUser(userId);
            if (user) {
              results.set(userId, user);
            }
          })
        ).then(() => {});
        
        promises.push(batchPromise);
      }
      
      await Promise.all(promises);
    }
    
    return results;
  }
  
  // 获取频道消息（带缓存）
  async getChannelMessages(channelId: number): Promise<ChatMessage[] | null> {
    const cacheKey = `channel-messages-${channelId}`;
    
    // 检查缓存
    const cached = this.channelMessagesCache.get(channelId);
    if (cached && Date.now() - cached.timestamp < this.CHANNEL_MESSAGES_CACHE_DURATION) {
      return cached.data;
    }
    
    // 检查是否有正在进行的请求
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<ChatMessage[] | null>;
    }
    
    try {
      const promise = chatAPI.getChannelMessages(channelId);
      this.pendingRequests.set(cacheKey, promise);
      
      const messages = await promise;
      
      // 缓存结果
      if (messages) {
        this.channelMessagesCache.set(channelId, {
          data: messages,
          timestamp: Date.now()
        });
        return messages;
      }
      
      return [];
    } catch (error) {
      console.error(`获取频道 ${channelId} 消息失败:`, error);
      return null;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  // 获取频道列表（带缓存）
  async getChannels(): Promise<ChatChannel[] | null> {
    const cacheKey = 'channel-list';
    
    // 检查缓存
    if (this.channelListCache && Date.now() - this.channelListCache.timestamp < this.CHANNEL_LIST_CACHE_DURATION) {
      return this.channelListCache.data;
    }
    
    // 检查是否有正在进行的请求
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<ChatChannel[] | null>;
    }
    
    try {
      const promise = chatAPI.getChannels();
      this.pendingRequests.set(cacheKey, promise);
      
      const channels = await promise;
      
      // 缓存结果
      if (channels) {
        this.channelListCache = {
          data: channels,
          timestamp: Date.now()
        };
        return channels;
      }
      
      return [];
    } catch (error) {
      console.error('获取频道列表失败:', error);
      return null;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }
  
  // 清除缓存
  clearCache() {
    this.userCache.clear();
    this.channelMessagesCache.clear();
    this.channelListCache = null;
    this.pendingRequests.clear();
  }
  
  // 清除特定频道的消息缓存（当有新消息时）
  invalidateChannelMessages(channelId: number) {
    this.channelMessagesCache.delete(channelId);
  }
  
  // 清除频道列表缓存（当频道列表发生变化时）
  invalidateChannelList() {
    this.channelListCache = null;
  }
  
  // 更新用户缓存
  updateUserCache(userId: number, userData: User) {
    this.userCache.set(userId, {
      data: userData,
      timestamp: Date.now()
    });
  }

  // 获取缓存的用户信息（同步方法）
  getCachedUser(userId: number): User | null {
    const cached = this.userCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.USER_CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // 检查用户是否在缓存中
  hasCachedUser(userId: number): boolean {
    const cached = this.userCache.get(userId);
    return !!cached && Date.now() - cached.timestamp < this.USER_CACHE_DURATION;
  }
}

// 导出单例实例
export const apiCache = new APICache();
