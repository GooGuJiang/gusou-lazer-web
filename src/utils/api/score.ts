import { api } from './client';

export const scoreAPI = {
  // 置顶成绩
  pinScore: async (scoreId: number) => {
    console.log('置顶成绩:', scoreId);
    const response = await api.put(`/api/v2/score-pins/${scoreId}`);
    return response.data;
  },

  // 取消置顶成绩
  unpinScore: async (scoreId: number) => {
    console.log('取消置顶成绩:', scoreId);
    const response = await api.delete(`/api/v2/score-pins/${scoreId}`);
    return response.data;
  },

  // 调整置顶成绩顺序
  reorderPinnedScore: async (
    scoreId: number,
    options: {
      after_score_id?: number;
      before_score_id?: number;
    }
  ) => {
    console.log('调整置顶成绩顺序:', scoreId, options);
    const response = await api.post(`/api/v2/score-pins/${scoreId}/reorder`, options);
    return response.data;
  },

  // 下载成绩回放
  downloadReplay: async (scoreId: number) => {
    console.log('下载成绩回放:', scoreId);
    const response = await api.get(`/api/v2/scores/${scoreId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

