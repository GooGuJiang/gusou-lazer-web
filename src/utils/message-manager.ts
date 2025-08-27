import type { Message, SendMessageRequest, CreatePrivateChatRequest, ChatMessageResp } from '../types/chat';
import { api } from './api';
import { v4 as uuidv4 } from 'uuid';

export class MessageManager {
  private pendingMessages = new Map<string, Message>();
  private onMessageSent?: (message: Message) => void;
  private onMessageFailed?: (uuid: string, error: string) => void;
  private onMessageReceived?: (message: Message) => void;

  constructor(
    onMessageSent?: (message: Message) => void,
    onMessageFailed?: (uuid: string, error: string) => void,
    onMessageReceived?: (message: Message) => void
  ) {
    this.onMessageSent = onMessageSent;
    this.onMessageFailed = onMessageFailed;
    this.onMessageReceived = onMessageReceived;
  }

  // Send message to existing channel
  async sendMessage(
    channelId: string | number,
    content: string,
    isAction: boolean = false,
    senderId: number
  ): Promise<Message> {
    const uuid = uuidv4();
    const timestamp = new Date().toISOString();

    // Create local echo message
    const localMessage: Message = {
      message_id: -1, // Temporary ID
      channel_id: Number(channelId),
      is_action: isAction,
      timestamp,
      content,
      sender_id: senderId,
      uuid
    };

    // Store pending message
    this.pendingMessages.set(uuid, localMessage);

    // Immediately show local echo
    if (this.onMessageReceived) {
      this.onMessageReceived(localMessage);
    }

    try {
      const request: SendMessageRequest = {
        message: content,
        is_action: isAction,
        uuid
      };

      const response = await api.request<ChatMessageResp>({
        url: `/api/v2/chat/channels/${channelId}/messages`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: request
      });

      // Convert response to Message format
      const sentMessage: Message = {
        message_id: response.data.message_id,
        channel_id: response.data.channel_id,
        is_action: response.data.is_action,
        timestamp: response.data.timestamp,
        content: response.data.content,
        sender: response.data.sender,
        sender_id: response.data.sender_id,
        uuid: response.data.uuid
      };

      // Remove from pending and notify success
      this.pendingMessages.delete(uuid);
      if (this.onMessageSent) {
        this.onMessageSent(sentMessage);
      }

      return sentMessage;
    } catch (error) {
      // Remove failed message from pending
      this.pendingMessages.delete(uuid);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      console.error('Failed to send message:', error);
      
      if (this.onMessageFailed) {
        this.onMessageFailed(uuid, errorMessage);
      }
      
      throw error;
    }
  }

  // Create new private chat and send first message
  async createPrivateChat(
    targetUserId: number,
    content: string,
    isAction: boolean = false,
    _senderId: number
  ): Promise<any> {
    const uuid = uuidv4();

    try {
      const request: CreatePrivateChatRequest = {
        target_id: targetUserId,
        message: content,
        is_action: isAction,
        uuid
      };

      const response = await api.request({
        url: '/api/v2/chat/new',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: request
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create private chat';
      console.error('Failed to create private chat:', error);
      
      if (this.onMessageFailed) {
        this.onMessageFailed(uuid, errorMessage);
      }
      
      throw error;
    }
  }

  // Handle incoming message from WebSocket
  handleIncomingMessage(message: Message) {
    // Check if this is a response to a pending message
    if (message.uuid && this.pendingMessages.has(message.uuid)) {
      const pendingMessage = this.pendingMessages.get(message.uuid)!;
      
      // Update the local message with server data
      const updatedMessage: Message = {
        ...pendingMessage,
        message_id: message.message_id,
        timestamp: message.timestamp,
        sender: message.sender
      };

      this.pendingMessages.delete(message.uuid);
      
      if (this.onMessageSent) {
        this.onMessageSent(updatedMessage);
      }
    } else {
      // This is a new message from another user
      if (this.onMessageReceived) {
        this.onMessageReceived(message);
      }
    }
  }

  // Get pending messages (for UI state)
  getPendingMessages(): Message[] {
    return Array.from(this.pendingMessages.values());
  }

  // Check if a message is pending
  isMessagePending(uuid: string): boolean {
    return this.pendingMessages.has(uuid);
  }

  // Remove a pending message (e.g., when it fails)
  removePendingMessage(uuid: string) {
    this.pendingMessages.delete(uuid);
  }

  // Clear all pending messages (useful for cleanup)
  clearPendingMessages() {
    this.pendingMessages.clear();
  }

  // Retry sending a failed message
  async retrySendMessage(originalMessage: Message): Promise<Message> {
    if (!originalMessage.uuid) {
      throw new Error('Cannot retry message without UUID');
    }

    return this.sendMessage(
      originalMessage.channel_id,
      originalMessage.content,
      originalMessage.is_action,
      originalMessage.sender_id
    );
  }

  // Format message content (e.g., handle mentions, emotes)
  formatMessageContent(content: string): string {
    // Basic formatting - can be extended
    return content
      .replace(/\n/g, '<br>')
      .replace(/@(\w+)/g, '<span class="mention">@$1</span>');
  }

  // Check if message content is valid
  validateMessageContent(content: string, maxLength: number = 4000): boolean {
    if (!content || content.trim().length === 0) {
      return false;
    }
    
    if (content.length > maxLength) {
      return false;
    }
    
    return true;
  }

  // Get message length limit for channel
  getMessageLengthLimit(channelType: string): number {
    switch (channelType) {
      case 'pm':
        return 4000;
      case 'public':
        return 2000;
      case 'multiplayer':
        return 1000;
      default:
        return 2000;
    }
  }
}
