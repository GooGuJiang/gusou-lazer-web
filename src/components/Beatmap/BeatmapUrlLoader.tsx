import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { beatmapAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { ExternalLink, Search } from 'lucide-react';

interface BeatmapUrlLoaderProps {
  onLoad?: (data: { beatmapset: any; beatmap?: any }) => void;
  className?: string;
}

const BeatmapUrlLoader: React.FC<BeatmapUrlLoaderProps> = ({ onLoad, className = '' }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      // 首先尝试使用内部路由转换
      const internalUrl = beatmapAPI.convertToInternalBeatmapUrl(url);
      
      if (internalUrl) {
        // 如果可以转换为内部路由，直接导航
        navigate(internalUrl);
      } else {
        // 否则尝试直接从 URL 获取数据
        const data = await beatmapAPI.getBeatmapFromUrl(url);
        
        if (onLoad) {
          onLoad(data);
        } else {
          // 导航到 beatmap 页面
          const targetUrl = data.beatmap 
            ? `/beatmapsets/${data.beatmapset.id}#${data.beatmap.mode || 'osu'}/${data.beatmap.id}`
            : `/beatmapsets/${data.beatmapset.id}`;
          navigate(targetUrl);
        }
      }
      
      toast.success(t('beatmap.urlLoadSuccess'));
      setUrl('');
    } catch (error) {
      console.error('Failed to load beatmap from URL:', error);
      toast.error(t('beatmap.urlLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const isValidOsuUrl = (url: string) => {
    return url.includes('osu.ppy.sh') && (url.includes('/beatmaps/') || url.includes('/beatmapsets/'));
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gradient-to-r from-osu-pink/10 to-transparent border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <ExternalLink size={20} className="text-osu-pink" />
          {t('beatmap.loadFromUrl')}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label htmlFor="beatmap-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {t('beatmap.urlPlaceholder')}
          </label>
          <div className="relative">
            <input
              id="beatmap-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://osu.ppy.sh/beatmapsets/123456#osu/789012"
              className="w-full px-4 py-3 pl-10 pr-12 border-2 border-slate-200 dark:border-slate-700 rounded-lg 
                        bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                        focus:ring-2 focus:ring-osu-pink focus:border-osu-pink
                        placeholder-slate-400 dark:placeholder-slate-500
                        transition-all"
              disabled={loading}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            {isValidOsuUrl(url) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!url.trim() || loading}
          className="w-full px-4 py-3 bg-osu-pink hover:bg-osu-pink/90 disabled:bg-slate-400 disabled:cursor-not-allowed
                    text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg
                    flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('beatmap.loading')}
            </>
          ) : (
            <>
              <Search size={16} />
              {t('beatmap.loadBeatmap')}
            </>
          )}
        </button>
      </form>
      
      <div className="px-6 pb-6 text-sm text-slate-600 dark:text-slate-400">
        <p className="mb-2 font-medium">{t('beatmap.supportedUrls')}:</p>
        <ul className="space-y-1.5 text-xs">
          <li className="flex items-start gap-2">
            <span className="text-osu-pink mt-0.5">●</span>
            <code className="flex-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">https://osu.ppy.sh/beatmapsets/123456</code>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-osu-pink mt-0.5">●</span>
            <code className="flex-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">https://osu.ppy.sh/beatmapsets/123456#osu/789012</code>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-osu-pink mt-0.5">●</span>
            <code className="flex-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">https://osu.ppy.sh/beatmaps/789012</code>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BeatmapUrlLoader;
