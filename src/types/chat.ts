// Chat related type definitions

export interface User {
  id: number;
  username: string;
  country: {
    code: string;
    name: string;
  };
  cover: {
    id?: string;
    url: string;
  };
  avatar_url: string;
  default_group: string;
  is_active: boolean;
  is_bot: boolean;
  is_deleted: boolean;
  is_online: boolean;
  is_supporter: boolean;
  last_visit?: string;
  pm_friends_only: boolean;
  profile_colour?: string;
  groups?: any[];
}

export interface Message {
  message_id: number;
  channel_id: number;
  is_action: boolean;
  timestamp: string;
  content: string;
  sender?: User;
  sender_id: number;
  uuid?: string;
}

export interface Channel {
  channel_id: number;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'multiplayer' | 'spectator' | 'temporary' | 'pm' | 'group';
  last_message_id?: number;
  last_read_id?: number;
  message_length_limit?: number;
  moderated?: boolean;
  users?: number[];
}

export interface SocketMessage<T = any> {
  event: string;
  data?: T;
  error?: string;
}

export interface NewChatMessageData {
  messages: Message[];
  users: User[];
}

export interface ChannelJoinData {
  channel: Channel;
}

export interface ChannelPartData {
  channel: Channel;
}

export interface StartChatRequest {
  event: 'chat.start';
}

export interface UpdateResponse {
  presence: User[];
  messages: Message[];
  silences?: any[];
}

export interface KeepAliveResponse {
  silences: any[];
}

export interface ChatChannelResp {
  channel_id: number;
  name: string;
  description?: string;
  type: string;
  last_message_id?: number;
  last_read_id?: number;
  moderated?: boolean;
  users?: number[];
}

export interface GetChannelResp extends ChatChannelResp {
  recent_messages?: Message[];
  users?: User[];
}

export interface ChatMessageResp {
  message_id: number;
  channel_id: number;
  is_action: boolean;
  timestamp: string;
  content: string;
  sender: User;
  sender_id: number;
  uuid?: string;
}

export interface SendMessageRequest {
  is_action?: boolean;
  message: string;
  uuid?: string;
}

export interface CreatePrivateChatRequest {
  target_id: number;
  message: string;
  is_action?: boolean;
  uuid?: string;
}

export interface NotificationItem {
  id: number;
  name: string;
  created_at: string;
  object_type: string;
  object_id: number;
  source_user_id?: number;
  category: string;
  details: any;
}

export interface NotificationResp {
  has_more: boolean;
  notifications: NotificationItem[];
  unread_count: number;
  notification_endpoint?: string;
}

export interface ChatState {
  channels: Map<number, Channel>;
  messages: Map<number, Message[]>;
  currentChannel?: number;
  isConnected: boolean;
  users: Map<number, User>;
  unreadCounts: Map<number, number>;
}

export interface ChatEventHandler {
  'chat.channel.join': (data: ChannelJoinData) => void;
  'chat.channel.part': (data: ChannelPartData) => void;
  'chat.message.new': (data: NewChatMessageData) => void;
  'connected': () => void;
  'disconnected': () => void;
  'error': (error: string) => void;
}
