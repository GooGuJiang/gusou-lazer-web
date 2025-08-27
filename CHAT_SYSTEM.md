# 聊天系统文档

## 概述

这是一个完整的实时聊天系统，基于 WebSocket 连接实现，支持多频道消息、私聊、通知等功能。

## 功能特性

### 核心功能
- ✅ WebSocket 实时连接
- ✅ 多频道支持（公开频道、私聊、群组等）
- ✅ 消息发送与接收
- ✅ 消息本地回显
- ✅ 连接断线重连
- ✅ 消息已读状态管理
- ✅ 通知系统
- ✅ 用户在线状态

### 消息类型
- 普通文本消息
- 动作消息（/me 命令）
- 支持 @提及 和链接识别

### 频道类型
- `public` - 公开频道
- `pm` - 私聊
- `multiplayer` - 多人游戏房间
- `spectator` - 观战频道
- `group` - 群组频道

## 系统架构

### 核心组件

1. **WebSocketChatClient** (`src/utils/websocket.ts`)
   - 管理 WebSocket 连接
   - 处理消息事件分发
   - 自动重连机制

2. **ChannelManager** (`src/utils/channel-manager.ts`)
   - 频道状态管理
   - 消息存储
   - API 调用封装

3. **MessageManager** (`src/utils/message-manager.ts`)
   - 消息发送逻辑
   - 本地回显处理
   - 消息状态跟踪

4. **NotificationClient** (`src/utils/notification-client.ts`)
   - 通知系统
   - 心跳保持
   - 增量更新

5. **ChatContext** (`src/contexts/ChatContext.tsx`)
   - React 状态管理
   - 组件间数据共享
   - 生命周期管理

### UI 组件

- **ChatContainer** - 主聊天容器
- **ChannelList** - 频道列表
- **MessageList** - 消息列表
- **MessageInput** - 消息输入框
- **NotificationList** - 通知列表

## 使用方法

### 1. 环境配置

在项目根目录创建 `.env` 文件：

```env
# Fallback WebSocket URL (actual URL will be fetched from notifications API)
VITE_WS_URL=wss://lazer-api.g0v0.top/notification-server
VITE_API_BASE_URL=https://lazer-api.g0v0.top
```

**注意**: 系统会自动从通知API (`/api/v2/notifications`) 获取正确的WebSocket端点地址，环境变量中的 `VITE_WS_URL` 仅作为后备选项。

### 2. 基本使用

聊天系统已集成到主应用中，当用户登录后会自动显示聊天窗口。

```tsx
// 聊天系统已在 App.tsx 中集成
<ChatProvider>
  <YourApp />
</ChatProvider>
```

### 3. 手动使用聊天功能

```tsx
import { useChatContext } from './contexts/ChatContext';

function YourComponent() {
  const {
    sendMessage,
    switchChannel,
    currentChannel,
    state
  } = useChatContext();

  // 发送消息
  const handleSend = async () => {
    await sendMessage(1, "Hello world!");
  };

  // 切换频道
  const handleSwitchChannel = async () => {
    await switchChannel(2);
  };

  return (
    <div>
      <p>当前频道: {currentChannel?.name}</p>
      <p>连接状态: {state.isConnected ? '已连接' : '未连接'}</p>
    </div>
  );
}
```

## API 接口

### WebSocket 事件

#### 发送事件
- `chat.start` - 开始聊天会话

#### 接收事件
- `chat.channel.join` - 加入频道
- `chat.channel.part` - 离开频道
- `chat.message.new` - 新消息

### HTTP API

#### 频道相关
- `GET /api/v2/chat/channels` - 获取频道列表
- `GET /api/v2/chat/channels/{id}` - 获取频道详情
- `PUT /api/v2/chat/channels/{id}/users/{userId}` - 加入频道
- `DELETE /api/v2/chat/channels/{id}/users/{userId}` - 离开频道

#### 消息相关
- `GET /api/v2/chat/channels/{id}/messages` - 获取消息历史
- `POST /api/v2/chat/channels/{id}/messages` - 发送消息
- `PUT /api/v2/chat/channels/{id}/mark-as-read/{messageId}` - 标记已读

#### 其他
- `GET /api/v2/chat/updates` - 获取增量更新
- `POST /api/v2/chat/ack` - 心跳保持
- `POST /api/v2/chat/new` - 创建私聊

## 消息流程

### 1. 连接建立
```
用户登录 -> 调用通知API获取WebSocket端点 -> 创建 WebSocket 连接 -> 发送 chat.start -> 拉取初始数据
```

### 2. 发送消息
```
用户输入 -> 创建本地回显 -> 发送 API 请求 -> 更新消息状态
```

### 3. 接收消息
```
WebSocket 接收 -> 解析消息数据 -> 更新本地状态 -> 通知 UI 更新
```

## 注意事项

### 1. 类型安全
所有导入的类型都使用 `import type` 语法，确保 TypeScript 编译正确。

### 2. 错误处理
- WebSocket 连接失败会自动重试
- API 请求失败会显示错误信息
- 消息发送失败会移除本地回显

### 3. 性能优化
- 消息分页加载
- 虚拟滚动（如需要）
- 连接池管理

### 4. 安全考虑
- 所有 API 请求都需要认证 token
- WebSocket 连接使用 token 验证
- 输入内容进行 XSS 防护

## 故障排除

### 常见问题

1. **WebSocket 连接失败**
   - 检查 `VITE_WS_URL` 配置
   - 确认服务器支持 WebSocket
   - 检查网络连接

2. **消息发送失败**
   - 确认用户已登录
   - 检查 API token 有效性
   - 验证频道权限

3. **类型错误**
   - 确保使用 `import type` 导入类型
   - 检查 TypeScript 配置

### 调试建议

1. 打开浏览器开发者工具查看 WebSocket 连接状态
2. 检查 Network 标签页的 API 请求
3. 查看 Console 中的错误日志

## 扩展功能

### 可能的改进

1. **消息功能**
   - 文件上传
   - 表情符号
   - 消息编辑/删除
   - 消息回复

2. **UI 增强**
   - 主题切换
   - 字体大小调整
   - 消息搜索
   - 快捷键支持

3. **高级功能**
   - 消息加密
   - 群组管理
   - 管理员功能
   - 消息统计

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **状态管理**: React Context
- **网络**: WebSocket + Axios
- **构建工具**: Vite

---

如有问题，请查看源代码注释或联系开发团队。
