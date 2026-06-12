import { api } from './client';

export const friendsAPI = {
  getFriends: async () => {
    const response = await api.get('/api/v2/friends');
    return response.data;
  },

  addFriend: async (targetUserId: number) => {
    const response = await api.post(`/api/v2/friends?target=${targetUserId}`);
    return response.data;
  },

  removeFriend: async (targetUserId: number) => {
    const response = await api.delete(`/api/v2/friends/${targetUserId}`);
    return response.data;
  },

  getBlocks: async () => {
    const response = await api.get('/api/v2/blocks');
    return response.data;
  },

  blockUser: async (targetUserId: number) => {
    const response = await api.post(`/api/v2/blocks?target=${targetUserId}`);
    return response.data;
  },

  unblockUser: async (targetUserId: number) => {
    const response = await api.delete(`/api/v2/blocks/${targetUserId}`);
    return response.data;
  },

  checkRelationship: async (targetUserId: number) => {
    try {
      const response = await api.get(`/api/private/relationship/check/${targetUserId}`);
      return response.data;
    } catch (error) {
      console.error('检查用户关系失败:', error);
      try {
        const [friends, blocks] = await Promise.all([
          friendsAPI.getFriends(),
          friendsAPI.getBlocks(),
        ]);

        const isFriend = friends.some(
          (friend: { target_id: number; mutual?: boolean }) => friend.target_id === targetUserId
        );
        const isBlocked = blocks.some(
          (block: { target_id: number }) => block.target_id === targetUserId
        );
        const isMutual = friends.some(
          (friend: { target_id: number; mutual?: boolean }) =>
            friend.target_id === targetUserId && friend.mutual === true
        );

        let followsMe = false;

        if (isFriend) {
          followsMe = isMutual;
        } else {
          followsMe = false;
        }

        return {
          is_following: isFriend,
          isBlocked: isBlocked,
          mutual: isMutual,
          is_followed: followsMe,
        };
      } catch (fallbackError) {
        console.error('备用方法也失败:', fallbackError);
        return {
          is_following: false,
          isBlocked: false,
          mutual: false,
          is_followed: false,
        };
      }
    }
  },

  getUserFollowers: async (userId: number) => {
    const response = await api.get(`/api/v2/relationship/followers/${userId}`);
    return response.data;
  },

  getUser: async (userId: number) => {
    const response = await api.get(`/api/v2/users/${userId}`);
    return response.data;
  },
};
