import { useState, useEffect, useRef } from 'react';
import { rankingsAPI } from '../utils/api';
import type { GameMode } from '../types';

interface Country {
  code: string;
  name: string;
}

// 全局缓存对象，按模式存储
const countryCache: Record<string, Country[]> = {};

export const useAvailableCountries = (mode: GameMode) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      // 如果已有缓存，直接使用
      if (countryCache[mode]) {
        setCountries(countryCache[mode]);
        return;
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      
      try {
        // 获取第一页国家排行榜，通常包含所有有数据的国家
        const response = await rankingsAPI.getCountryRankings(mode, 1);
        
        if (!abortController.signal.aborted && response.ranking) {
          const availableCountries: Country[] = response.ranking.map((ranking: any) => ({
            code: ranking.code,
            name: ranking.name,
          }));

          // 存入缓存
          countryCache[mode] = availableCountries;
          setCountries(availableCountries);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('获取可用国家列表失败:', error);
          // 如果失败，返回空数组
          setCountries([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchCountries();

    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [mode]);

  return { countries, isLoading };
};

