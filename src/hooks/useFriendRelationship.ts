import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { friendsAPI, handleApiError } from '../utils/api';
import { getApiErrorStatus, getApiErrorMessage, getErrorMessage } from '../utils/typeGuards';

export type FriendStatus = {
  isFriend: boolean;
  isBlocked: boolean;
  isMutual: boolean;
  followsMe: boolean;
  loading: boolean;
  isSelf: boolean;
};

export function useFriendRelationship(targetUserId: number, selfUserId: number) {
  const mountedRef = useRef(true);
  
  // 添加调试日志
  console.log('useFriendRelationship called with:', { targetUserId, selfUserId });
  
  // 参数验证
  const isValidUserId = (id: unknown): id is number => {
    return typeof id === 'number' && !isNaN(id) && id > 0;
  };
  
  if (!isValidUserId(targetUserId)) {
    console.error('Invalid targetUserId:', targetUserId);
  }
  
  if (!isValidUserId(selfUserId)) {
    console.error('Invalid selfUserId:', selfUserId);
  }
  
  const [status, setStatus] = useState<FriendStatus>({
    isFriend: false,
    isBlocked: false,
    isMutual: false,
    followsMe: false,
    loading: true, // 初始总是 loading，让 API 来判断
    isSelf: false, // 初始假设不是自己，让 API 来判断
  });

  const refresh = useCallback(async () => {
    // 验证 targetUserId 是否有效
    if (!isValidUserId(targetUserId)) {
      console.error('Cannot make API call with invalid targetUserId:', targetUserId);
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }
    
    // 验证 selfUserId 是否有效
    if (!isValidUserId(selfUserId)) {
      console.error('Cannot make API call with invalid selfUserId:', selfUserId);
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      console.log('Making API call to check relationship for userId:', targetUserId);
      setStatus(prev => ({ ...prev, loading: true }));
      
      const res = await friendsAPI.checkRelationship(targetUserId);
      console.log('API response:', res);
      
      if (!mountedRef.current) return;

      // 映射 API 响应字段到组件状态
      setStatus({
        isFriend: !!res?.is_following,    // 我是否关注对方
        isBlocked: !!res?.isBlocked,      // 是否屏蔽（API 可能不返回此字段）
        isMutual: !!res?.mutual,          // 是否互相关注
        followsMe: !!res?.is_followed,    // 对方是否关注我
        loading: false,
        isSelf: false,
      });
      
      console.log('Mapped status:', {
        original: res,
        mapped: {
          isFriend: !!res?.is_following,
          isBlocked: !!res?.isBlocked,
          isMutual: !!res?.mutual,
          followsMe: !!res?.is_followed,
        }
      });
    } catch (err: unknown) {
      console.log('API call failed:', err);
      
      // 检查是否是"不能查看自己"的错误
      const errorMessage = getApiErrorMessage(err) || getErrorMessage(err);
      const isSelfError = errorMessage.includes('Cannot check relationship with yourself') || 
                         errorMessage.includes('yourself') ||
                         (getApiErrorStatus(err) === 422 && errorMessage.includes('relationship'));
      
      if (isSelfError) {
        console.log('Detected self-relationship error, setting isSelf to true');
        if (mountedRef.current) {
          setStatus({
            isFriend: false,
            isBlocked: false,
            isMutual: false,
            followsMe: false,
            loading: false,
            isSelf: true,
          });
        }
        return; // 不显示错误toast，这是正常情况
      }
      
      // 其他错误正常处理
      console.error('Real API error:', {
        targetUserId,
        selfUserId,
        errorMessage,
        status: getApiErrorStatus(err)
      });
      
      if (mountedRef.current) {
        setStatus(prev => ({ ...prev, loading: false }));
      }
      handleApiError(err);
    }
  }, [targetUserId, selfUserId]);

  useEffect(() => {
    mountedRef.current = true;
    
    console.log('useEffect triggered:', { targetUserId, selfUserId });
    
    // 总是尝试请求，让后端来判断是否为自己
    refresh();

    return () => {
      mountedRef.current = false;
    };
  }, [targetUserId, selfUserId, refresh]);

  // 动态获取 isSelf 状态
  const currentIsSelf = status.isSelf;

  // 乐观更新辅助函数
  const withOptimisticUpdate = useCallback((
    updater: (prev: FriendStatus) => FriendStatus,
    action: () => Promise<unknown>,
    okMsg?: string
  ) => {
    const prev = status;
    const optimistic = updater(prev);
    setStatus(optimistic);

    return action()
      .then(() => {
        if (okMsg) toast.success(okMsg);
        return refresh();
      })
      .catch((err) => {
        setStatus(prev);
        handleApiError(err);
      });
  }, [status, refresh]);

  // 创建操作函数
  const add = useCallback(() => {
    console.log('Add friend called:', { targetUserId, currentIsSelf, isValidTargetUserId: isValidUserId(targetUserId) });
    
    if (currentIsSelf) {
      console.log('Cannot add self as friend');
      return Promise.resolve();
    }
    
    if (!isValidUserId(targetUserId)) {
      console.error('Cannot add friend - invalid targetUserId:', targetUserId);
      toast.error('无效的用户ID');
      return Promise.reject(new Error('Invalid targetUserId'));
    }
    
    return withOptimisticUpdate(
      (s) => ({ ...s, isFriend: true }),
      () => {
        console.log('Calling friendsAPI.addFriend with targetUserId:', targetUserId);
        return friendsAPI.addFriend(targetUserId);
      },
      '已关注该用户'
    );
  }, [targetUserId, currentIsSelf, withOptimisticUpdate]);

  const remove = useCallback(() => {
    if (currentIsSelf) return Promise.resolve();
    
    return withOptimisticUpdate(
      (s) => ({ ...s, isFriend: false, isMutual: false }),
      () => friendsAPI.removeFriend(targetUserId),
      '已取消关注'
    );
  }, [targetUserId, currentIsSelf, withOptimisticUpdate]);

  const block = useCallback(() => {
    if (currentIsSelf) return Promise.resolve();
    
    return withOptimisticUpdate(
      (s) => ({ ...s, isBlocked: true, isFriend: false, isMutual: false }),
      () => friendsAPI.blockUser(targetUserId),
      '已屏蔽该用户'
    );
  }, [targetUserId, currentIsSelf, withOptimisticUpdate]);

  const unblock = useCallback(() => {
    if (currentIsSelf) return Promise.resolve();
    
    return withOptimisticUpdate(
      (s) => ({ ...s, isBlocked: false }),
      () => friendsAPI.unblockUser(targetUserId),
      '已取消屏蔽'
    );
  }, [targetUserId, currentIsSelf, withOptimisticUpdate]);
  console.log('Current status:', status);
  return {
    status,
    isSelf: currentIsSelf,
    refresh,
    add,
    remove,
    block,
    unblock,
  };
}