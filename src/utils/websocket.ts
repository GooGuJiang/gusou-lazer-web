import type { SocketMessage, ChatEventHandler } from '../types/chat';

export class WebSocketChatClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isIntentionalClose = false;
  private eventHandlers: Partial<ChatEventHandler> = {};
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Try different authentication methods for WebSocket
        let wsUrl = this.url;
        
        // If URL already contains protocol and query params, append token
        if (this.url.includes('?')) {
          wsUrl = `${this.url}&access_token=${this.token}`;
        } else {
          wsUrl = `${this.url}?access_token=${this.token}`;
        }
        
        console.log('Connecting to WebSocket:', wsUrl);
        
        // Create WebSocket connection - osu uses Authorization header method
        this.ws = new WebSocket(this.url);
        
        // Set authorization in WebSocket subprotocols if supported
        // Note: WebSocket in browser doesn't support custom headers directly

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startPing();
          this.emit('connected');
          
          // Send authentication if not already in URL
          if (!wsUrl.includes('access_token')) {
            this.sendAuth();
          }
          
          // Send chat start request
          this.sendChatStart();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: SocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            url: wsUrl
          });
          this.stopPing();
          this.emit('disconnected');

          if (!this.isIntentionalClose && this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
            console.log(`WebSocket will reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect();
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
        reject(error);
      }
    });
  }

  disconnect() {
    this.isIntentionalClose = true;
    this.stopPing();
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

  private sendAuth() {
    this.send({
      event: 'auth',
      data: {
        token: this.token
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
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('Attempted to send message while WebSocket is not connected');
    }
  }

  private handleMessage(message: SocketMessage) {
    if (message.error) {
      console.error('WebSocket message error:', message.error);
      this.emit('error', message.error);
      return;
    }

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
        console.log('Unhandled WebSocket message:', message);
    }
  }

  private startPing() {
    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ event: 'ping' });
      }
    }, 30000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
