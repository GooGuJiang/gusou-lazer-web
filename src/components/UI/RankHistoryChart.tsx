import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { FiBarChart2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface RankHistoryData {
  data: number[];
}

interface RankHistoryChartProps {
  rankHistory?: RankHistoryData;
  isUpdatingMode?: boolean;
  selectedModeColor?: string;
  title?: string;
  delay?: number;
  height?: string | number;
  showTitle?: boolean;
  fullBleed?: boolean; // 是否左右顶满
}

const RankHistoryChart: React.FC<RankHistoryChartProps> = ({
  rankHistory,
  isUpdatingMode = false,
  selectedModeColor = '#e91e63',
  delay = 0.4,
  height = '16rem',
  fullBleed = true,
}) => {
  const { t } = useTranslation();
  // 数据预处理：去除 0（视为缺失），保留时间顺序
  const chartData = React.useMemo(() => {
    const src = rankHistory?.data ?? [];
    if (src.length === 0) return [];

    const validData = src
      .map((rank, originalIdx) => ({
        originalIdx,
        rank: rank === 0 ? null : rank,
      }))
      .filter(d => d.rank !== null) as Array<{ originalIdx: number; rank: number }>;

    return validData.map((item, newIdx) => ({
      idx: newIdx,
      rank: item.rank,
    }));
  }, [rankHistory?.data]);

  const total = chartData.length;

  // === 关键修复：为 Y 轴增加上下缓冲，避免极值处被裁半 ===
  const yDomain = React.useMemo<[number | 'auto', number | 'auto']>(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    const values = chartData.map(d => d.rank as number);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    // 按范围的 5% 取整做缓冲，至少 1
    const pad = Math.max(1, Math.round((dataMax - dataMin) * 0.05));
    return [dataMin - pad, dataMax + pad];
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-2xl p-6 outline-none focus:outline-none ring-0 focus:ring-0"
      style={{ outline: 'none' }}
    >
      <div className={fullBleed ? '-mx-6' : ''} style={{ height }}>
        {isUpdatingMode ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-center" style={{ color: 'var(--text-muted)' }}>
              <FiBarChart2 className="mx-auto text-4xl mb-2" />
              <p>{t('profile.rankHistory.loading')}</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              // 上下给一点额外 margin，配合 yDomain 的缓冲更稳
              margin={{ top: 12, right: 0, left: 0, bottom: 12 }}
            >
              <XAxis dataKey="idx" hide />
              {/* 上小下大：反转 Y 轴；并使用带缓冲的 domain */}
              <YAxis
                type="number"
                dataKey="rank"
                hide
                reversed
                domain={yDomain}
                allowDecimals={false}
                // 如果数据突变导致临时越界，也能先画出来不被裁
                allowDataOverflow
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
                labelFormatter={(label) => {
                  const idx = Number(label);
                  const daysAgo = total - 1 - idx; // 最右是最新
                  return daysAgo === 0 
                    ? t('profile.rankHistory.justNow') 
                    : t('profile.rankHistory.daysAgo', { count: daysAgo });
                }}
                formatter={(value) => [`#${value}`, t('profile.rankHistory.globalRank')]}
              />
              <Line
                type="monotone"
                dataKey="rank"
                stroke={selectedModeColor}
                strokeWidth={3}
                dot={false}
                activeDot={false}
                connectNulls={false}
                // 线端圆角，边缘看起来更自然
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FiBarChart2 className="mx-auto text-4xl mb-2" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>{t('profile.rankHistory.noData')}</p>
            </div>
          </div>
        )}
      </div>
      <style>{`
        *:focus { outline: none; }
        textarea:focus, input:focus { outline: none; }
      `}</style>
    </motion.div>
  );
};

export default RankHistoryChart;
