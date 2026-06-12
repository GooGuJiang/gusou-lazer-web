# 个人页面编辑系统 - 架构说明

## 📋 数据流架构

### 1. **用户页面数据获取**

- **显示用户页面**: 直接从 `/api/v2/me/` 响应中的 `page` 字段获取
- **编辑用户页面**: 使用 `/api/private/user/page` 接口进行更新

### 2. **API 接口说明**

#### 📖 页面内容获取

```typescript
// 从用户对象获取页面数据
const userPage = user.page; // { html: string, raw: string }
```

#### ✏️ 页面内容编辑

```typescript
// 更新页面内容
await userAPI.updateUserPage(userId, content);
// 返回: { html: string }
```

#### ✅ BBCode 验证

```typescript
// 实时验证BBCode语法
await userAPI.validateBBCode(content);
// 返回: { valid: boolean, errors: string[], preview: { html: string, raw: string } }
```

### 3. **组件数据流**

```
UserPage.tsx (管理用户状态)
    ↓
UserProfileLayout.tsx (集成页面显示和编辑)
    ↓
UserPageDisplay.tsx (显示) ←→ UserPageEditor.tsx (编辑)
    ↓                              ↓
user.page 字段                  BBCodeEditor.tsx
```

### 4. **状态管理**

1. **UserPage**: 维护完整的用户对象状态
2. **UserProfileLayout**: 管理编辑模式切换
3. **UserPageDisplay**: 直接从 `user.page` 读取内容
4. **UserPageEditor**:
   - 初始化时从 `user.page.raw` 获取内容
   - 保存时调用 API 更新
   - 保存成功后通过回调更新父组件的用户状态

### 5. **关键实现细节**

#### ✨ 优化点

- **减少API调用**: 显示时不需要额外的API请求
- **实时同步**: 编辑保存后立即更新本地状态
- **一致性**: 确保显示和编辑使用相同的数据源

#### 🔄 数据同步流程

1. 用户访问页面 → 获取用户数据（包含 `page` 字段）
2. 显示页面内容 → 直接使用 `user.page.html`
3. 点击编辑 → 从 `user.page.raw` 初始化编辑器
4. 保存更改 → 调用编辑API → 更新本地用户状态
5. 返回显示模式 → 显示更新后的内容

### 6. **API 规范对应**

根据提供的API文档：

- ✅ `GET /api/private/user/page` - 仅用于编辑时获取最新内容
- ✅ `PUT /api/private/user/page` - 更新用户页面内容
- ✅ `POST /api/private/user/validate-bbcode` - BBCode语法验证

用户页面内容的主要来源是 `/api/v2/me/` 响应中的 `page` 字段：

```json
{
  "page": {
    "html": "<processed-html-content>",
    "raw": "[bbcode]原始BBCode内容[/bbcode]"
  }
}
```

### 7. **测试和调试**

使用 `UserPageTestPage.tsx` 可以：

- 测试三种模式：显示、编辑、BBCode编辑器
- 查看用户页面数据结构
- 验证保存后的数据同步
- 调试BBCode验证和预览功能

## 🎯 总结

这个架构确保了：

1. **性能优化**: 减少不必要的API调用
2. **数据一致性**: 统一的数据源和更新机制
3. **用户体验**: 实时预览和即时反馈
4. **可维护性**: 清晰的组件职责分离
