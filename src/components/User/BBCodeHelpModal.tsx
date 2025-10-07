import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';

interface BBCodeHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BBCodeHelpModal: React.FC<BBCodeHelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const bbcodeTags = [
    {
      category: '文本格式',
      tags: [
        { tag: '[b]粗体[/b]', description: '粗体文本', example: '**粗体**' },
        { tag: '[i]斜体[/i]', description: '斜体文本', example: '*斜体*' },
        { tag: '[u]下划线[/u]', description: '下划线文本', example: '下划线文本' },
        { tag: '[strike]删除线[/strike]', description: '删除线文本', example: '~~删除线~~' },
        { tag: '[spoiler]剧透[/spoiler]', description: '剧透条，鼠标悬停显示', example: '███████' },
      ]
    },
    {
      category: '颜色和大小',
      tags: [
        { tag: '[color=red]红色[/color]', description: '彩色文本', example: '红色文本' },
        { tag: '[color=#ff0000]红色[/color]', description: '十六进制颜色', example: '红色文本' },
        { tag: '[size=150]大字[/size]', description: '字体大小 (50, 85, 100, 150)', example: '大字' },
      ]
    },
    {
      category: '排版',
      tags: [
        { tag: '[centre]居中[/centre]', description: '居中对齐', example: '居中文本' },
        { tag: '[heading]标题[/heading]', description: '大标题', example: '# 标题' },
        { tag: '[quote]引用[/quote]', description: '引用块', example: '> 引用内容' },
        { tag: '[quote="作者"]引用[/quote]', description: '带作者的引用', example: '> 作者: 引用内容' },
      ]
    },
    {
      category: '列表',
      tags: [
        { tag: '[list]\n[*]项目1\n[*]项目2\n[/list]', description: '无序列表', example: '• 项目1\n• 项目2' },
        { tag: '[list=1]\n[*]项目1\n[*]项目2\n[/list]', description: '有序列表', example: '1. 项目1\n2. 项目2' },
      ]
    },
    {
      category: '代码',
      tags: [
        { tag: '[c]行内代码[/c]', description: '行内代码', example: '`代码`' },
        { tag: '[code]\n代码块\n[/code]', description: '代码块', example: '```\n代码块\n```' },
      ]
    },
    {
      category: '链接和媒体',
      tags: [
        { tag: '[url=链接]文本[/url]', description: '链接', example: '链接文本' },
        { tag: '[profile=123456]用户[/profile]', description: '用户主页链接', example: '用户链接' },
        { tag: '[email=邮箱]邮箱[/email]', description: '邮箱链接', example: '邮箱链接' },
        { tag: '[img]图片URL[/img]', description: '插入图片', example: '[图片]' },
        { tag: '[youtube]视频ID[/youtube]', description: 'YouTube视频', example: '[视频]' },
        { tag: '[audio]音频URL[/audio]', description: '音频播放器', example: '[音频]' },
      ]
    },
    {
      category: '交互元素',
      tags: [
        { tag: '[box=标题]内容[/box]', description: '折叠框', example: '▼ 标题' },
        { tag: '[spoilerbox]内容[/spoilerbox]', description: '剧透框', example: '▼ SPOILER' },
        { tag: '[notice]通知[/notice]', description: '通知框', example: '⚠️ 重要通知' },
        { 
          tag: '[imagemap]\n图片URL\n10.0 10.0 30.0 20.0 https://example.com 链接标题\n25.0 40.0 50.0 30.0 # 无链接区域\n[/imagemap]', 
          description: '图片映射 - 在图片上创建可点击区域。格式：X Y 宽度 高度 链接 标题（百分比坐标）', 
          example: '[交互图片]' 
        },
      ]
    },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            BBCode 标签帮助
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('profile.userPage.bbcodeDescription')}
            </div>

            {bbcodeTags.map((category, categoryIndex) => (
              <div key={categoryIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  {category.category}
                </h3>
                <div className="space-y-3">
                  {category.tags.map((tag, tagIndex) => (
                    <div key={tagIndex} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded">
                      <div>
                        <div className="text-sm font-mono text-gray-800 dark:text-gray-200 mb-1">
                          {tag.tag}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {tag.description}
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">效果预览:</div>
                        <div className="whitespace-pre-line">{tag.example}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                提示
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• 标签可以嵌套使用，如 [b][i]粗斜体[/i][/b]</li>
                <li>• 标签必须正确配对，开始和结束标签要对应</li>
                <li>• 某些标签如 [color] 和 [size] 需要参数</li>
                <li>• 可以使用工具栏按钮快速插入标签</li>
                <li>• {t('profile.userPage.usePreview')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-osu-pink hover:opacity-90 text-white rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default BBCodeHelpModal;