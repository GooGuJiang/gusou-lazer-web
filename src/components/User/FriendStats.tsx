import { FaBell } from "react-icons/fa";
import FriendActions from "./FriendActions";
import { useFriendRelationship } from "../../hooks/useFriendRelationship";
import { useAuth } from "../../contexts/AuthContext";
type User = { id: number; follower_count?: number; unread_pm_count?: number };

export default function FriendStats({ user, selfId }: { user: User; selfId?: number }) {
  const { user: self } = useAuth();
  const resolvedSelfId = selfId ?? self?.id;
  
  // 直接检查是否为自己
  const isCurrentUserSelf = resolvedSelfId === user.id;
  
  // 始终调用 hook（遵循 React Hooks 规则），即使参数可能无效
  const {
    status,
    isSelf,
    add,
    remove,
    block,
    unblock,
  } = useFriendRelationship(user.id ?? 0, resolvedSelfId ?? 0);
  
  // 如果没有有效的用户ID，显示加载状态
  if (!resolvedSelfId || !user?.id) {
    console.log('Missing user IDs:', { resolvedSelfId, userId: user?.id });
    return (
      <div className="flex gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span>加载中...</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 friend-button-shadow">
          <FaBell className="w-4 h-4" />
          <span>{user.unread_pm_count ?? 0}</span>
        </div>
      </div>
    );
  }

  // 优先使用直接比较的结果，只有当无法确定时才使用 hook 的结果
  const finalIsSelf = isCurrentUserSelf;

  console.log('FriendStats debug:', { 
    resolvedSelfId, 
    userId: user.id, 
    isCurrentUserSelf, 
    hookIsSelf: isSelf,
    finalIsSelf,
    status 
  });

  return (
    <div className="flex gap-3 relative">
      <FriendActions
        status={status}
        onAdd={add}
        onRemove={remove}
        onBlock={block}
        onUnblock={unblock}
        followerCount={user.follower_count ?? 0}
        isSelf={finalIsSelf}
      />
      <div className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 friend-button-shadow">
        <FaBell className="w-4 h-4" />
        <span>{user.unread_pm_count ?? 0}</span>
      </div>
    </div>
  );
}
