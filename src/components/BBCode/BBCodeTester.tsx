import React, { useState } from 'react';
import { parseBBCode } from '../../utils/bbcodeParser';
import BBCodeRenderer from '../BBCode/BBCodeRenderer';

/**
 * BBCode测试组件，用于验证解析器功能
 */
const BBCodeTester: React.FC = () => {
  const [input, setInput] = useState(`[b]粗体文本[/b]
[i]斜体文本[/i]
[u]下划线文本[/u]
[s]删除线文本[/s]
[color=red]红色文本[/color]
[size=150]大文本[/size]

[quote="测试用户"]这是一个引用示例[/quote]

[code]
function hello() {
    console.log("Hello World!");
}
[/code]

[spoiler]这是剧透内容[/spoiler]

[box=折叠框标题]这是折叠框内容[/box]

[list]
[*]列表项1
[*]列表项2
[*]列表项3
[/list]

[url=https://osu.ppy.sh]osu!官网[/url]
[profile=123456]用户链接[/profile]

[centre]居中文本[/centre]

[heading]这是标题[/heading]

[notice]重要通知内容[/notice]

[img]https://assets.ppy.sh/images/osu-logo.png[/img]

[youtube]dQw4w9WgXcQ[/youtube]`);

  const parseResult = parseBBCode(input);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">BBCode解析器测试</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 输入区域 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">BBCode输入</h2>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-card text-gray-900 dark:text-gray-100 resize-none"
            placeholder="在这里输入BBCode..."
          />
          
          {/* 解析状态 */}
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              parseResult.valid 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {parseResult.valid ? '✓ 解析成功' : `✗ ${parseResult.errors.length}个错误`}
            </div>
          </div>
          
          {/* 错误列表 */}
          {parseResult.errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">解析错误:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                {parseResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* 预览区域 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">HTML预览</h2>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-card p-4 h-96 overflow-auto">
            <BBCodeRenderer html={parseResult.html} />
          </div>
          
          {/* HTML源码 */}
          <details className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <summary className="p-3 cursor-pointer font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              查看HTML源码
            </summary>
            <pre className="p-4 text-xs text-gray-600 dark:text-gray-400 overflow-auto bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <code>{parseResult.html}</code>
            </pre>
          </details>
        </div>
      </div>
      
      {/* 支持的标签说明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">支持的BBCode标签</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">文本格式</h4>
            <ul className="space-y-1 text-blue-600 dark:text-blue-400">
              <li>[b]粗体[/b]</li>
              <li>[i]斜体[/i]</li>
              <li>[u]下划线[/u]</li>
              <li>[s]删除线[/s]</li>
              <li>[color=red]颜色[/color]</li>
              <li>[size=150]大小[/size]</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">块级元素</h4>
            <ul className="space-y-1 text-blue-600 dark:text-blue-400">
              <li>[quote]引用[/quote]</li>
              <li>[code]代码[/code]</li>
              <li>[box=标题]折叠框[/box]</li>
              <li>[spoilerbox]剧透框[/spoilerbox]</li>
              <li>[list][*]列表[/list]</li>
              <li>[centre]居中[/centre]</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">链接和媒体</h4>
            <ul className="space-y-1 text-blue-600 dark:text-blue-400">
              <li>[url=链接]文本[/url]</li>
              <li>[profile=ID]用户[/profile]</li>
              <li>[img]图片URL[/img]</li>
              <li>[youtube]视频ID[/youtube]</li>
              <li>[audio]音频URL[/audio]</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BBCodeTester;