import type { SocketMessage, ChatEventHandler } from '../types/chat';

/**
 * WebSocket client implementation based on osu! lazer source code
 * This follows the pattern used in WebSocketNotificationsClient.cs
 */
export class OsuWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isIntentionalClose = false;
  private eventHandlers: Partial<ChatEventHandler> = {};
  private messageBuffer: string = '';

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket:', this.url);
        
        // Create WebSocket connection with token as query parameter
        // This is the most reliable method for browser-based WebSocket auth
        const separator = this.url.includes('?') ? '&' : '?';
        const wsUrlWithToken = `${this.url}${separator}access_token=${this.token}`;
        
        console.log('Connecting with query parameter authentication');
        this.ws = new WebSocket(wsUrlWithToken);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.reconnectAttempts = 0;
          this.emit('connected');
          
          // Send chat start request (token already in URL)
          this.sendChatStart();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            url: this.url
          });
          
          this.emit('disconnected');

          if (!this.isIntentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
            console.log(`WebSocket will reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect().catch(error => {
                console.error('Reconnection failed:', error);
              });
            }, delay);
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached. WebSocket connection failed.');
            this.emit('error', 'Max reconnection attempts reached');
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', 'WebSocket connection error');
          reject(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  on<K extends keyof ChatEventHandler>(event: K, handler: ChatEventHandler[K]) {
    this.eventHandlers[event] = handler;
  }

  off<K extends keyof ChatEventHandler>(event: K) {
    delete this.eventHandlers[event];
  }

  private emit<K extends keyof ChatEventHandler>(event: K, ...args: any[]) {
    const handler = this.eventHandlers[event];
    if (handler) {
      try {
        (handler as any)(...args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    }
  }

  private handleMessage(data: string) {
    try {
      // Handle message buffering for multi-part messages
      this.messageBuffer += data;
      
      // Try to parse the complete message
      let message: SocketMessage;
      try {
        message = JSON.parse(this.messageBuffer);
        this.messageBuffer = ''; // Clear buffer on successful parse
      } catch {
        // Message might be incomplete, wait for more data
        return;
      }

      if (message.error) {
        console.error('WebSocket message error:', message.error);
        this.emit('error', message.error);
        return;
      }

      console.log('Received WebSocket message:', message);

      // Handle different message types based on osu! implementation
      switch (message.event) {
        case 'chat.channel.join':
          this.emit('chat.channel.join', message.data);
          break;
        
        case 'chat.channel.part':
          this.emit('chat.channel.part', message.data);
          break;
        
        case 'chat.message.new':
          this.emit('chat.message.new', message.data);
          break;
        
        default:
          console.log('Unhandled WebSocket message event:', message.event);
      }

    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      this.messageBuffer = ''; // Clear buffer on parse error
    }
  }

  private sendAuthentication() {
    // Send authentication message (another common WebSocket auth pattern)
    this.send({
      event: 'auth',
      data: {
        token: this.token,
        type: 'bearer'
      }
    });
  }

  private sendChatStart() {
    this.send({
      event: 'chat.start'
    });
  }

  private send(message: SocketMessage) {
    if (this.isConnected() && this.ws) {
      try {
        const jsonMessage = JSON.stringify(message);
        console.log('Sending WebSocket message:', jsonMessage);
        this.ws.send(jsonMessage);
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('Attempted to send message while WebSocket is not connected');
    }
  }

  // Send arbitrary message (for extensibility)
  sendMessage(message: SocketMessage) {
    this.send(message);
  }
}
