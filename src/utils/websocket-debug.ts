/**
 * WebSocket debugging utility to help diagnose connection issues
 * Based on osu! lazer WebSocket implementation patterns
 */

export class WebSocketDebugger {
  static async testConnection(url: string, token: string): Promise<void> {
    console.log('=== WebSocket Connection Debug ===');
    console.log('URL:', url);
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 20) + '...');

    // Test different connection methods (focused on query parameters)
    const methods = [
      {
        name: 'Query Parameter (access_token) - Primary Method',
        url: `${url}${url.includes('?') ? '&' : '?'}access_token=${token}`,
        protocols: undefined,
        sendAuth: false
      },
      {
        name: 'Query Parameter (token) - Alternative',
        url: `${url}${url.includes('?') ? '&' : '?'}token=${token}`,
        protocols: undefined,
        sendAuth: false
      },
      {
        name: 'Authorization Bearer Header (Legacy Support)',
        url: url,
        protocols: [`authorization.bearer.${token.substring(0, 50)}`],
        sendAuth: false
      }
    ];

    for (const method of methods) {
      console.log(`\nTesting method: ${method.name}`);
      console.log('URL:', method.url);
      console.log('Protocols:', method.protocols);
      
      try {
        const ws = method.protocols 
          ? new WebSocket(method.url, method.protocols)
          : new WebSocket(method.url);

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            ws.close();
            reject(new Error('Connection timeout'));
          }, 5000);

          ws.onopen = () => {
            console.log(`✅ ${method.name}: Connected successfully`);
            clearTimeout(timeout);
            
            // Send auth message if required
            if (method.sendAuth) {
              try {
                ws.send(JSON.stringify({
                  event: 'auth',
                  data: {
                    token: token,
                    type: 'bearer'
                  }
                }));
                console.log(`✅ ${method.name}: Auth message sent`);
              } catch (error) {
                console.log(`❌ ${method.name}: Failed to send auth message:`, error);
              }
            }
            
            // Try sending a test message
            try {
              ws.send(JSON.stringify({
                event: 'chat.start'
              }));
              console.log(`✅ ${method.name}: Chat start message sent`);
            } catch (error) {
              console.log(`❌ ${method.name}: Failed to send chat start message:`, error);
            }
            
            // Keep connection open for a bit to see responses
            setTimeout(() => {
              ws.close();
              resolve();
            }, 2000);
          };

          ws.onerror = (error) => {
            console.log(`❌ ${method.name}: Connection error:`, error);
            clearTimeout(timeout);
            reject(error);
          };

          ws.onclose = (event) => {
            console.log(`🔌 ${method.name}: Connection closed:`, {
              code: event.code,
              reason: event.reason,
              wasClean: event.wasClean
            });
          };

          ws.onmessage = (event) => {
            console.log(`📨 ${method.name}: Received message:`, event.data);
          };
        });

      } catch (error) {
        console.log(`❌ ${method.name}: Failed to create WebSocket:`, error);
      }
    }
  }

  static logWebSocketState(ws: WebSocket): void {
    const states = {
      [WebSocket.CONNECTING]: 'CONNECTING',
      [WebSocket.OPEN]: 'OPEN', 
      [WebSocket.CLOSING]: 'CLOSING',
      [WebSocket.CLOSED]: 'CLOSED'
    };

    console.log('WebSocket State:', states[ws.readyState] || 'UNKNOWN');
    console.log('WebSocket URL:', ws.url);
    console.log('WebSocket Protocol:', ws.protocol);
  }
}
