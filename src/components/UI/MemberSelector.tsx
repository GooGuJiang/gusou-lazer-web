import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiChevronDown, FiUser } from 'react-icons/fi';
import { GiCrown } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import type { User } from '../../types';

interface MemberSelectorProps {
  value: number | null;
  onChange: (value: number | null) => void;
  members: User[];
  currentLeaderId?: number;
  placeholder?: string;
  className?: string;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({
  value,
  onChange,
  members,
  currentLeaderId,
  placeholder,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 键盘导航
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSelect = useCallback((selectedValue: number | null) => {
    onChange(selectedValue);
    setIsOpen(false);
  }, [onChange]);

  // 过滤掉当前队长
  const availableMembers = members.filter(member => member.id !== currentLeaderId);
  
  // 获取当前选中的成员
  const selectedMember = value ? members.find(member => member.id === value) : null;

  return (
    <div 
      className={`relative ${className}`}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg
                   bg-card text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-osu-pink focus:border-transparent
                   flex items-center justify-between transition-colors
                   hover:border-gray-300 dark:hover:border-gray-600"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {selectedMember ? (
            <>
              <div className="flex-shrink-0">
                <img
                  src={selectedMember.avatar_url || '/default-avatar.png'}
                  alt={selectedMember.username}
                  className="w-6 h-6 rounded-full"
                />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="font-medium truncate">
                  {selectedMember.username}
                </span>
                {selectedMember.country?.name && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>{selectedMember.country.name}</span>
                    {selectedMember.country.code && (
                      <img
                        src={`/image/flag/${selectedMember.country.code.toLowerCase()}.svg`}
                        alt={selectedMember.country.name}
                        className="w-3 h-2"
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <FiUser className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">
                {placeholder || t('teams.create.keepCurrentLeader')}
              </span>
            </>
          )}
        </div>
        
        <FiChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 下拉选项 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {/* 保持当前队长选项 */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                         flex items-center gap-3 ${
                           value === null 
                             ? 'bg-osu-pink/10 text-osu-pink border-r-2 border-osu-pink' 
                             : 'text-gray-900 dark:text-white'
                         }`}
            >
              <GiCrown className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">
                {placeholder || t('teams.create.keepCurrentLeader')}
              </span>
            </button>

            {/* 分隔线 */}
            {availableMembers.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700" />
            )}

            {/* 可选择的成员 */}
            {availableMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelect(member.id)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                           flex items-center gap-3 ${
                             value === member.id 
                               ? 'bg-osu-pink/10 text-osu-pink border-r-2 border-osu-pink' 
                               : 'text-gray-900 dark:text-white'
                           }`}
              >
                <div className="flex-shrink-0">
                  <img
                    src={member.avatar_url || '/default-avatar.png'}
                    alt={member.username}
                    className="w-6 h-6 rounded-full"
                  />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="font-medium truncate">
                    {member.username}
                  </span>
                  {member.country?.name && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{member.country.name}</span>
                      {member.country.code && (
                        <img
                          src={`/image/flag/${member.country.code.toLowerCase()}.svg`}
                          alt={member.country.name}
                          className="w-3 h-2"
                        />
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}

            {/* 空状态 */}
            {availableMembers.length === 0 && (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                <FiUser className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('teams.create.noMembersAvailable')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberSelector;
