# WebSocket Authentication Update

## 概述

已更新WebSocket认证系统，现在同时支持查询参数和Authorization头部两种认证方式。

## 前端变更

### 新的WebSocket客户端 (`src/utils/osu-websocket.ts`)

- 基于osu!源码实现的WebSocket客户端
- 使用查询参数传递access_token
- 简化了连接逻辑，提高了可靠性

**连接方式：**
```typescript
const wsUrl = `${baseUrl}?access_token=${token}`;
const ws = new WebSocket(wsUrl);
```

### 调试工具 (`src/utils/websocket-debug.ts`)

- 提供多种认证方法测试
- 在开发环境中可通过聊天界面的调试按钮触发
- 详细的连接日志和错误信息

## 后端变更

### 通知服务器 (`g0v0-server-main/app/router/notification/server.py`)

**更新的WebSocket端点：**
```python
@chat_router.websocket("/notification-server")
async def chat_websocket(
    websocket: WebSocket,
    access_token: str = Query(None, alias="access_token"),
    token: str = Query(None, alias="token"),
    authorization: str = Header(None),
    factory: DBFactory = Depends(get_db_factory),
):
```

**认证优先级：**
1. 查询参数 `access_token`
2. 查询参数 `token`
3. Authorization头部 `Bearer <token>`

### SignalR路由器 (`g0v0-server-main/app/signalr/router.py`)

同样的多重认证支持已应用到SignalR WebSocket端点。

## 支持的认证方式

### 1. 查询参数认证（推荐）

**方式1：**
```
wss://api.example.com/notification-server?access_token=<your_token>
```

**方式2：**
```
wss://api.example.com/notification-server?token=<your_token>
```

### 2. Authorization头部认证（向后兼容）

```
Authorization: Bearer <your_token>
```

## 优势

1. **浏览器兼容性**：查询参数方式在所有浏览器中都能正常工作
2. **向后兼容**：保留了原有的Authorization头部支持
3. **灵活性**：支持多种token参数名
4. **调试友好**：提供详细的认证日志和错误信息

## 使用示例

### 前端连接

```typescript
import { OsuWebSocketClient } from './utils/osu-websocket';

const client = new OsuWebSocketClient(
  'wss://api.example.com/notification-server',
  'your_access_token_here'
);

await client.connect();
```

### 服务器端验证日志

```
Using access_token from query parameter: eyJhbGciOiJIUzI1NiIs...
User authenticated successfully: username123 (ID: 456)
```

## 测试

在开发环境中：
1. 打开聊天界面
2. 点击头部的调试按钮（十字图标）
3. 查看浏览器控制台获取详细的连接测试结果

## 故障排除

### 连接失败

1. 检查token是否有效
2. 确认URL格式正确
3. 查看服务器日志获取详细错误信息

### 认证失败

1. 验证token权限（需要`chat.read`权限）
2. 检查token是否过期
3. 确认用户账户状态正常

## 迁移指南

### 从旧的WebSocket客户端迁移

1. 将 `WebSocketChatClient` 替换为 `OsuWebSocketClient`
2. 移除自定义认证逻辑
3. Token会自动添加到URL查询参数中

### 服务器端

- 无需客户端修改，新代码向后兼容
- 现有的Authorization头部认证继续工作
- 新的查询参数认证自动可用
