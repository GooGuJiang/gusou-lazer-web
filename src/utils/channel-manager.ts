import type { Channel, Message, User, ChatChannelResp, GetChannelResp } from '../types/chat';
import { api } from './api';

export class ChannelManager {
  private channels = new Map<number, Channel>();
  private messages = new Map<number, Message[]>();
  private users = new Map<number, User>();
  private unreadCounts = new Map<number, number>();

  // Channel operations
  getChannel(channelId: number): Channel | undefined {
    return this.channels.get(channelId);
  }

  getAllChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  addChannel(channel: Channel) {
    this.channels.set(channel.channel_id, channel);
    if (!this.messages.has(channel.channel_id)) {
      this.messages.set(channel.channel_id, []);
    }
  }

  removeChannel(channelId: number) {
    this.channels.delete(channelId);
    this.messages.delete(channelId);
    this.unreadCounts.delete(channelId);
  }

  updateChannel(channelId: number, updates: Partial<Channel>) {
    const existing = this.channels.get(channelId);
    if (existing) {
      this.channels.set(channelId, { ...existing, ...updates });
    }
  }

  // Message operations
  getMessages(channelId: number): Message[] {
    return this.messages.get(channelId) || [];
  }

  addMessage(message: Message) {
    const channelMessages = this.messages.get(message.channel_id) || [];
    
    // Check if message already exists (avoid duplicates)
    if (!channelMessages.find(m => m.message_id === message.message_id)) {
      // Insert message in chronological order
      const insertIndex = channelMessages.findIndex(m => m.message_id > message.message_id);
      if (insertIndex === -1) {
        channelMessages.push(message);
      } else {
        channelMessages.splice(insertIndex, 0, message);
      }
      
      this.messages.set(message.channel_id, channelMessages);
      
      // Update channel's last message
      const channel = this.channels.get(message.channel_id);
      if (channel && (!channel.last_message_id || message.message_id > channel.last_message_id)) {
        this.updateChannel(message.channel_id, { last_message_id: message.message_id });
      }
    }
  }

  addMessages(messages: Message[]) {
    messages.forEach(message => this.addMessage(message));
  }

  removeMessage(channelId: number, messageId: number) {
    const channelMessages = this.messages.get(channelId) || [];
    const filteredMessages = channelMessages.filter(m => m.message_id !== messageId);
    this.messages.set(channelId, filteredMessages);
  }

  // User operations
  addUser(user: User) {
    this.users.set(user.id, user);
  }

  addUsers(users: User[]) {
    users.forEach(user => this.addUser(user));
  }

  getUser(userId: number): User | undefined {
    return this.users.get(userId);
  }

  // Unread count operations
  getUnreadCount(channelId: number): number {
    return this.unreadCounts.get(channelId) || 0;
  }

  setUnreadCount(channelId: number, count: number) {
    this.unreadCounts.set(channelId, Math.max(0, count));
  }

  incrementUnreadCount(channelId: number) {
    const current = this.getUnreadCount(channelId);
    this.setUnreadCount(channelId, current + 1);
  }

  markAsRead(channelId: number) {
    this.setUnreadCount(channelId, 0);
    
    const channel = this.channels.get(channelId);
    const messages = this.messages.get(channelId);
    if (channel && messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      this.updateChannel(channelId, { last_read_id: lastMessage.message_id });
    }
  }

  // API operations
  async fetchChannels(): Promise<Channel[]> {
    try {
      const response = await api.request<ChatChannelResp[]>({ url: '/api/v2/chat/channels' });
      const channels = response.data.map(this.mapChannelResponse);
      
      channels.forEach(channel => this.addChannel(channel));
      return channels;
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      throw error;
    }
  }

  async fetchChannel(channelId: string | number): Promise<Channel> {
    try {
      const response = await api.request<GetChannelResp>({ url: `/api/v2/chat/channels/${channelId}` });
      const channel = this.mapChannelResponse(response.data);
      
      this.addChannel(channel);
      
      if (response.data.recent_messages) {
        this.addMessages(response.data.recent_messages);
      }
      
      if (response.data.users) {
        this.addUsers(response.data.users);
      }
      
      return channel;
    } catch (error) {
      console.error('Failed to fetch channel:', error);
      throw error;
    }
  }

  async fetchMessages(channelId: string | number, options: {
    limit?: number;
    since?: number;
    until?: number;
  } = {}): Promise<Message[]> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.since) params.append('since', options.since.toString());
      if (options.until) params.append('until', options.until.toString());
      
      const response = await api.request<Message[]>({ url: `/api/v2/chat/channels/${channelId}/messages?${params}` });
      
      this.addMessages(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw error;
    }
  }

  async joinChannel(channelId: string | number, userId: number): Promise<Channel> {
    try {
      const response = await api.request<ChatChannelResp>({
        url: `/api/v2/chat/channels/${channelId}/users/${userId}`,
        method: 'PUT'
      });
      
      const channel = this.mapChannelResponse(response.data);
      this.addChannel(channel);
      return channel;
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  async leaveChannel(channelId: string | number, userId: number): Promise<void> {
    try {
      await api.request({
        url: `/api/v2/chat/channels/${channelId}/users/${userId}`,
        method: 'DELETE'
      });
      
      // Don't remove the channel from local state as user might still want to see history
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }

  async markMessageAsRead(channelId: string | number, messageId: number): Promise<void> {
    try {
      await api.request({
        url: `/api/v2/chat/channels/${channelId}/mark-as-read/${messageId}`,
        method: 'PUT'
      });
      
      this.updateChannel(Number(channelId), { last_read_id: messageId });
      this.markAsRead(Number(channelId));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  }

  private mapChannelResponse(response: ChatChannelResp | GetChannelResp): Channel {
    return {
      channel_id: response.channel_id,
      name: response.name,
      description: response.description,
      type: response.type as Channel['type'],
      last_message_id: response.last_message_id,
      last_read_id: response.last_read_id,
      moderated: response.moderated,
      users: 'users' in response && Array.isArray(response.users) && response.users.length > 0 && typeof response.users[0] === 'object' 
        ? (response.users as User[]).map(u => u.id)
        : response.users as number[] | undefined
    };
  }

  // Clear all data (useful for logout)
  clear() {
    this.channels.clear();
    this.messages.clear();
    this.users.clear();
    this.unreadCounts.clear();
  }
}
