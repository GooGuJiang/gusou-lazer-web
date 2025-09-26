# 用户验证系统使用说明

## 概述

该系统实现了自动处理API返回的用户验证错误，当服务器返回格式如下的错误时：

```json
{
  "error": {
    "error": "User not verified",
    "method": "totp"
  }
}
```

系统会自动弹出验证模态框，要求用户完成验证。

## 文件结构

```
src/
├── components/VerificationModal/
│   ├── VerificationModal.tsx    # 验证模态框组件
│   └── index.ts                 # 导出文件
├── contexts/
│   └── VerificationContext.tsx  # 验证上下文和Provider
├── utils/api/
│   ├── verification.ts          # 验证相关API方法
│   └── client.ts               # 更新了全局错误处理
├── hooks/
│   └── useVerificationExample.ts # 使用示例
└── App.tsx                      # 添加了VerificationProvider
```

## 自动处理

系统已经在 `App.tsx` 中添加了 `VerificationProvider`，所有的API请求都会自动检查验证错误。

当检测到验证错误时：
1. 自动弹出验证模态框
2. 用户无法关闭模态框（强制验证）
3. 支持TOTP和邮箱验证切换
4. 验证成功后自动关闭模态框

## 手动触发验证

如果需要手动触发验证流程：

```typescript
import { useVerification } from '../contexts/VerificationContext';

const MyComponent = () => {
  const { showVerificationModal } = useVerification();

  const handleAction = async () => {
    try {
      await showVerificationModal('totp'); // 或 'mail'
      console.log('验证成功');
    } catch (error) {
      console.log('验证失败');
    }
  };

  return (
    <button onClick={handleAction}>
      触发验证
    </button>
  );
};
```

## API端点

系统使用以下API端点：

1. **验证会话**: `POST /api/v2/session/verify`
   - 提交验证码完成验证
   - 参数: `verification_key` (8位邮箱验证码或6位TOTP码)

2. **重新发送验证码**: `POST /api/v2/session/verify/reissue`
   - 重新发送邮箱验证码

3. **切换到邮箱验证**: `POST /api/v2/session/verify/mail-fallback`
   - 从TOTP切换到邮箱验证模式

## 验证流程

1. 用户执行需要验证的操作
2. 服务器返回验证错误
3. 系统自动显示验证模态框
4. 用户输入验证码
5. 系统提交验证码到服务器
6. 验证成功后关闭模态框，失败则显示错误

## 特性

- ✅ 强制验证（模态框不可关闭）
- ✅ 支持TOTP和邮箱验证
- ✅ 自动切换验证方式
- ✅ 重新发送验证码
- ✅ 实时错误提示
- ✅ 响应式设计
- ✅ 暗色主题支持
- ✅ 全局自动处理

## 错误处理

系统会处理以下错误情况：
- 验证码错误
- 网络错误
- 切换验证方式失败
- 重新发送验证码失败

所有错误都会在模态框中显示友好的错误信息。





