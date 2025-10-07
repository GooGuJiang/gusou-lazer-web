import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { BBCodeValidationResponse } from '../../types';
import { 
  FaBold, FaItalic, FaUnderline, FaStrikethrough, FaImage, FaLink, 
  FaQuoteLeft, FaCode, FaList, FaEye, FaEyeSlash, FaYoutube,
  FaEnvelope, FaUser, FaMusic, FaExclamationTriangle, FaMapMarked,
  FaPalette, FaFont, FaHeading, FaAlignCenter, FaMask, FaBox, FaQuestionCircle
} from 'react-icons/fa';
import LoadingSpinner from '../UI/LoadingSpinner';
import { parseBBCode } from '../../utils/bbcodeParser';
import BBCodeRenderer from '../BBCode/BBCodeRenderer';
import BBCodeHelpModal from './BBCodeHelpModal';

interface BBCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  disabled?: boolean;
  title?: string; // 新增标题属性
}

interface BBCodeTool {
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  action: () => void;
  shortcut?: string;
}

const BBCodeEditor: React.FC<BBCodeEditorProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  maxLength = 60000,
  disabled = false,
  title, // 新增标题参数
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('profile.bbcodeEditor.placeholder');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<BBCodeValidationResponse | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // 防抖验证函数
  const debouncedValidation = useCallback(async (content: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      if (content.trim()) {
        try {
          setValidationLoading(true);
          setValidationError(null);
          
          // 先使用本地解析器进行基础验证
          const localResult = parseBBCode(content);
          
          // 设置本地验证结果，避免重复调用服务器
          setValidationResult({
            valid: localResult.valid,
            errors: localResult.errors,
            preview: {
              html: localResult.html,
              raw: content
            }
          });
        } catch (error) {
          console.error('BBCode validation error:', error);
          setValidationError(t('profile.bbcodeEditor.validation.networkError'));
          setValidationResult(null);
        } finally {
          setValidationLoading(false);
        }
      } else {
        setValidationResult(null);
        setValidationLoading(false);
      }
    }, 300); // 减少防抖时间
  }, []);

  // 当内容变化时触发验证
  useEffect(() => {
    debouncedValidation(value);
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [value, debouncedValidation]);

  // 插入BBCode标签的辅助函数
  const insertBBCode = useCallback((openTag: string, closeTag: string, defaultContent: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 保存当前焦点状态
    const wasActive = document.activeElement === textarea;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const contentToWrap = selectedText || defaultContent;
    
    const newText = value.substring(0, start) + 
                   openTag + contentToWrap + closeTag + 
                   value.substring(end);
    
    onChange(newText);

    // 使用requestAnimationFrame确保DOM更新后再设置光标位置
    requestAnimationFrame(() => {
      if (textarea && wasActive) {
        try {
          textarea.focus();
          if (selectedText) {
            textarea.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
          } else {
            textarea.setSelectionRange(start + openTag.length, start + openTag.length + defaultContent.length);
          }
        } catch (error) {
          // 忽略可能的焦点设置错误
          console.debug('Focus restoration failed:', error);
        }
      }
    });
  }, [value, onChange]);

  // BBCode工具栏配置
  const tools: BBCodeTool[] = [
    // 基础格式化
    {
      icon: FaBold,
      tooltip: `${t('profile.bbcodeEditor.toolbar.bold')} (Ctrl+B)`,
      shortcut: 'ctrl+b',
      action: () => insertBBCode('[b]', '[/b]', t('profile.bbcodeEditor.insertText.bold')),
    },
    {
      icon: FaItalic,
      tooltip: `${t('profile.bbcodeEditor.toolbar.italic')} (Ctrl+I)`,
      shortcut: 'ctrl+i',
      action: () => insertBBCode('[i]', '[/i]', t('profile.bbcodeEditor.insertText.italic')),
    },
    {
      icon: FaUnderline,
      tooltip: `${t('profile.bbcodeEditor.toolbar.underline')} (Ctrl+U)`,
      shortcut: 'ctrl+u',
      action: () => insertBBCode('[u]', '[/u]', t('profile.bbcodeEditor.insertText.underline')),
    },
    {
      icon: FaStrikethrough,
      tooltip: t('profile.bbcodeEditor.toolbar.strikethrough'),
      action: () => insertBBCode('[strike]', '[/strike]', t('profile.bbcodeEditor.insertText.strikethrough')),
    },
    {
      icon: FaPalette,
      tooltip: t('profile.bbcodeEditor.toolbar.color'),
      action: () => insertBBCode('[color=red]', '[/color]', t('profile.bbcodeEditor.insertText.colorText')),
    },
    {
      icon: FaFont,
      tooltip: t('profile.bbcodeEditor.toolbar.fontSize'),
      action: () => insertBBCode('[size=100]', '[/size]', t('profile.bbcodeEditor.insertText.text')),
    },
    
    // 内容插入
    {
      icon: FaImage,
      tooltip: t('profile.bbcodeEditor.toolbar.image'),
      action: () => insertBBCode('[img]', '[/img]', 'https://example.com/image.jpg'),
    },
    {
      icon: FaLink,
      tooltip: t('profile.bbcodeEditor.toolbar.link'),
      action: () => insertBBCode('[url=', `]${t('profile.bbcodeEditor.insertText.linkText')}[/url]`, 'https://example.com'),
    },
    {
      icon: FaUser,
      tooltip: t('profile.bbcodeEditor.toolbar.userProfile'),
      action: () => insertBBCode('[profile=', `]${t('profile.bbcodeEditor.insertText.username')}[/profile]`, '123456'),
    },
    {
      icon: FaEnvelope,
      tooltip: t('profile.bbcodeEditor.toolbar.email'),
      action: () => insertBBCode('[email=', `]${t('profile.bbcodeEditor.insertText.emailLink')}[/email]`, 'example@example.com'),
    },
    {
      icon: FaYoutube,
      tooltip: t('profile.bbcodeEditor.toolbar.youtube'),
      action: () => insertBBCode('[youtube]', '[/youtube]', 'dQw4w9WgXcQ'),
    },
    {
      icon: FaMusic,
      tooltip: t('profile.bbcodeEditor.toolbar.audio'),
      action: () => insertBBCode('[audio]', '[/audio]', 'https://example.com/audio.mp3'),
    },
    {
      icon: FaMapMarked,
      tooltip: t('profile.bbcodeEditor.toolbar.imagemap'),
      action: () => insertBBCode('[imagemap]\n', `\n10.0 10.0 30.0 20.0 https://example.com ${t('profile.bbcodeEditor.insertText.clickToVisit')}\n50.0 30.0 40.0 25.0 # ${t('profile.bbcodeEditor.insertText.infoArea')}\n[/imagemap]`, 'https://example.com/image.jpg'),
    },
    
    // 结构化内容
    {
      icon: FaQuoteLeft,
      tooltip: t('profile.bbcodeEditor.toolbar.quote'),
      action: () => insertBBCode('[quote]', '[/quote]', t('profile.bbcodeEditor.insertText.quoteContent')),
    },
    {
      icon: FaCode,
      tooltip: t('profile.bbcodeEditor.toolbar.code'),
      action: () => insertBBCode('[code]', '[/code]', t('profile.bbcodeEditor.insertText.codeContent')),
    },
    {
      icon: FaList,
      tooltip: t('profile.bbcodeEditor.toolbar.list'),
      action: () => insertBBCode('[list]\n[*]', `\n[*]${t('profile.bbcodeEditor.insertText.item2')}\n[/list]`, t('profile.bbcodeEditor.insertText.item1')),
    },
    {
      icon: FaBox,
      tooltip: t('profile.bbcodeEditor.toolbar.box'),
      action: () => insertBBCode(`[box=${t('profile.bbcodeEditor.insertText.title')}]`, '[/box]', t('profile.bbcodeEditor.insertText.collapsibleContent')),
    },
    {
      icon: FaMask,
      tooltip: t('profile.bbcodeEditor.toolbar.spoiler'),
      action: () => insertBBCode('[spoiler]', '[/spoiler]', t('profile.bbcodeEditor.insertText.spoilerContent')),
    },
    {
      icon: FaAlignCenter,
      tooltip: t('profile.bbcodeEditor.toolbar.center'),
      action: () => insertBBCode('[centre]', '[/centre]', t('profile.bbcodeEditor.insertText.centerText')),
    },
    {
      icon: FaHeading,
      tooltip: t('profile.bbcodeEditor.toolbar.heading'),
      action: () => insertBBCode('[heading]', '[/heading]', t('profile.bbcodeEditor.insertText.headingText')),
    },
    {
      icon: FaExclamationTriangle,
      tooltip: t('profile.bbcodeEditor.toolbar.notice'),
      action: () => insertBBCode('[notice]', '[/notice]', t('profile.bbcodeEditor.insertText.importantNotice')),
    },
  ];

  // 工具栏按钮点击处理
  const handleToolClick = useCallback((e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  }, []);

  // 键盘快捷键处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const tool = tools.find(t => t.shortcut === `ctrl+${e.key.toLowerCase()}`);
      if (tool) {
        e.preventDefault();
        tool.action();
      }
    }
  }, [tools]);

  // 颜色选择器
  const insertColor = useCallback((color: string) => {
    insertBBCode(`[color=${color}]`, '[/color]', t('profile.bbcodeEditor.insertText.colorText'));
  }, [insertBBCode, t]);

  // 字体大小选择器
  const insertSize = useCallback((size: number) => {
    insertBBCode(`[size=${size}]`, '[/size]', `${size}px ${t('profile.bbcodeEditor.insertText.text')}`);
  }, [insertBBCode, t]);

  return (
    <div className={`${className}`}>
      {/* 标题栏 */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
      )}
      
      {/* 编辑器容器 */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-card">
        {/* 工具栏 */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center gap-1 flex-wrap">
          {/* 基础格式化工具 */}
          <div className="flex items-center gap-1">
            {tools.slice(0, 6).map((tool, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => handleToolClick(e, tool.action)}
                disabled={disabled}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={tool.tooltip}
              >
                <tool.icon className="w-3 h-3 text-gray-600 dark:text-gray-300" />
              </button>
            ))}
          </div>
          
          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          {/* 内容插入工具 */}
          <div className="flex items-center gap-1">
            {tools.slice(6, 13).map((tool, index) => (
              <button
                key={index + 6}
                type="button"
                onClick={(e) => handleToolClick(e, tool.action)}
                disabled={disabled}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={tool.tooltip}
              >
                <tool.icon className="w-3 h-3 text-gray-600 dark:text-gray-300" />
              </button>
            ))}
          </div>
          
          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          {/* 结构化内容工具 */}
          <div className="flex items-center gap-1">
            {tools.slice(13).map((tool, index) => (
              <button
                key={index + 13}
                type="button"
                onClick={(e) => handleToolClick(e, tool.action)}
                disabled={disabled}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={tool.tooltip}
              >
                <tool.icon className="w-3 h-3 text-gray-600 dark:text-gray-300" />
              </button>
            ))}
          </div>
          
          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          {/* 快速颜色选择 */}
          <div className="flex items-center gap-1">
            {['red', 'blue', 'green', 'purple', 'orange'].map(color => (
              <button
                key={color}
                type="button"
                onClick={(e) => handleToolClick(e, () => insertColor(color))}
                disabled={disabled}
                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform disabled:cursor-not-allowed"
                style={{ backgroundColor: color }}
                title={`${color} ${t('profile.bbcodeEditor.colors.text')}`}
              />
            ))}
          </div>
          
          {/* 分隔线 */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          {/* 字体大小 */}
          <select
            onChange={(e) => e.target.value && insertSize(parseInt(e.target.value))}
            disabled={disabled}
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            defaultValue=""
          >
            <option value="" disabled>{t('profile.bbcodeEditor.fontSize.label')}</option>
            <option value="50">{t('profile.bbcodeEditor.fontSize.extraSmall')} (50)</option>
            <option value="85">{t('profile.bbcodeEditor.fontSize.small')} (85)</option>
            <option value="100">{t('profile.bbcodeEditor.fontSize.normal')} (100)</option>
            <option value="150">{t('profile.bbcodeEditor.fontSize.large')} (150)</option>
          </select>
        </div>

        {/* 预览切换和字数统计 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {value.length}/{maxLength}
          </span>
          
          <button
            type="button"
            onClick={(e) => handleToolClick(e, () => setIsHelpModalOpen(true))}
            disabled={disabled}
            className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('profile.bbcodeEditor.help.title')}
          >
            <FaQuestionCircle className="w-3 h-3" />
            <span className="hidden sm:inline">{t('profile.bbcodeEditor.help.button')}</span>
          </button>
          
          <button
            type="button"
            onClick={(e) => handleToolClick(e, () => setIsPreviewMode(!isPreviewMode))}
            disabled={disabled}
            className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPreviewMode ? (
              <>
                <FaEyeSlash className="w-3 h-3" />
                <span className="hidden sm:inline">{t('profile.bbcodeEditor.modes.edit')}</span>
              </>
            ) : (
              <>
                <FaEye className="w-3 h-3" />
                <span className="hidden sm:inline">{t('profile.bbcodeEditor.modes.preview')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 编辑器内容区域 */}
      <div className="relative">
        {isPreviewMode ? (
          /* 预览模式 */
          <div className="p-4 min-h-[300px] h-[50vh] overflow-y-auto">
            {validationLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{t('profile.bbcodeEditor.preview.generating')}</span>
              </div>
            ) : validationError ? (
              <div className="text-center py-8 text-red-500 dark:text-red-400 text-sm">
                {validationError}
              </div>
            ) : validationResult?.preview ? (
              <BBCodeRenderer 
                html={validationResult.preview.html} 
                className="prose prose-sm dark:prose-invert max-w-none"
              />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                {value.trim() ? t('profile.bbcodeEditor.preview.generateFailed') : t('profile.bbcodeEditor.preview.noContent')}
              </div>
            )}
          </div>
        ) : (
          /* 编辑模式 */
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={defaultPlaceholder}
            disabled={disabled}
            maxLength={maxLength}
            className="w-full p-4 min-h-[300px] h-[50vh] resize-none bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 font-mono text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ lineHeight: '1.6' }}
          />
        )}

        {/* 验证结果指示器 */}
        {!isPreviewMode && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            {validationLoading && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs">
                <LoadingSpinner size="sm" />
                <span>{t('profile.bbcodeEditor.validation.validating')}</span>
              </div>
            )}
            
            {validationResult && !validationLoading && (
              <div className={`px-2 py-1 rounded-md text-xs ${
                validationResult.valid 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {validationResult.valid ? `✓ ${t('profile.bbcodeEditor.validation.syntaxCorrect')}` : `✗ ${validationResult.errors.length}${t('profile.bbcodeEditor.validation.errors')}`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 验证错误列表 */}
      {validationResult && !validationResult.valid && validationResult.errors.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-red-50 dark:bg-red-900/10">
          <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
            {t('profile.bbcodeEditor.validation.syntaxErrors')}:
          </div>
          <ul className="list-disc list-inside space-y-1">
            {validationResult.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600 dark:text-red-400">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 帮助文本 - 更紧凑的设计 */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-1 bg-gray-50 dark:bg-gray-700/30">
        <details className="text-xs text-gray-600 dark:text-gray-400">
          <summary className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 py-1">
            {t('profile.bbcodeEditor.help.title')}
          </summary>
          <div className="mt-1 pb-1 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-0.5 text-xs">
            <div><strong>[b]{t('profile.bbcodeEditor.help.examples.bold')}[/b]</strong></div>
            <div><em>[i]{t('profile.bbcodeEditor.help.examples.italic')}[/i]</em></div>
            <div><u>[u]{t('profile.bbcodeEditor.help.examples.underline')}[/u]</u></div>
            <div><del>[s]{t('profile.bbcodeEditor.help.examples.strikethrough')}[/s]</del></div>
            <div>[color=red]{t('profile.bbcodeEditor.help.examples.color')}[/color]</div>
            <div>[size=16]{t('profile.bbcodeEditor.help.examples.size')}[/size]</div>
            <div>[url={t('profile.bbcodeEditor.help.examples.link')}]{t('profile.bbcodeEditor.help.examples.text')}[/url]</div>
            <div>[img]{t('profile.bbcodeEditor.help.examples.imageUrl')}[/img]</div>
            <div>[quote]{t('profile.bbcodeEditor.help.examples.quote')}[/quote]</div>
            <div>[code]{t('profile.bbcodeEditor.help.examples.code')}[/code]</div>
            <div className="md:col-span-1 col-span-2">[list][*]{t('profile.bbcodeEditor.help.examples.item1')}[*]{t('profile.bbcodeEditor.help.examples.item2')}[/list]</div>
          </div>
        </details>
      </div>

      {/* BBCode帮助模态框 */}
      <BBCodeHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
      </div>
    </div>
  );
};

export default BBCodeEditor;