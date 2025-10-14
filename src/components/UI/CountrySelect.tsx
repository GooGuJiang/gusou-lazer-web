import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCountryName } from '../../utils/countryName';

export interface Country {
  code: string;
  name: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  countries?: Country[]; // 新增：支持外部传入国家列表
  isLoading?: boolean; // 新增：加载状态
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  placeholder = "选择国家或输入国家代码",
  countries = [],
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 为每个国家添加翻译名称
  const translatedCountries = countries.map(country => ({
    ...country,
    translatedName: getCountryName(t, country.code, country.name)
  }));

  const filteredCountries = translatedCountries.filter(country =>
    country.translatedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 检查下拉菜单应该向上还是向下展开
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 240; // max-h-60 的高度

      // 如果下方空间不足且上方空间更多，则向上展开
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    setSearchTerm(newValue);
    setIsOpen(true);
    onChange(newValue);
  };

  const handleSelectCountry = (country: Country) => {
    setInputValue(country.code);
    onChange(country.code);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const selectedCountry = translatedCountries.find(c => c.code === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-card text-gray-900 dark:text-white shadow-sm min-h-[44px] sm:min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {/* 国旗显示 */}
          {selectedCountry && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <img
                src={`/image/flag/${selectedCountry.code.toLowerCase()}.svg`}
                alt={selectedCountry.code}
                className="w-5 h-4 rounded-sm"
                title={selectedCountry.translatedName}
              />
            </div>
          )}
          
          {/* 下拉箭头 */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {/* 清除按钮 */}
        {value && (
          <button
            onClick={handleClear}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-500 text-white rounded-lg sm:rounded-xl hover:bg-gray-600 transition-colors shadow-sm font-medium text-sm sm:text-base min-h-[44px] sm:min-h-[48px] flex items-center justify-center"
          >
            清除
          </button>
        )}
      </div>

      {/* 下拉列表 */}
      {isOpen && (
        <div className={`absolute z-50 w-full bg-card border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-lg max-h-60 overflow-y-auto ${dropdownPosition === 'bottom' ? 'mt-1' : 'mb-1 bottom-full'}`}>
          {isLoading ? (
            <div className="px-3 py-4 text-gray-500 dark:text-gray-400 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
              <span className="ml-2">加载中...</span>
            </div>
          ) : filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleSelectCountry(country)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none flex items-center gap-3"
              >
                <img
                  src={`/image/flag/${country.code.toLowerCase()}.svg`}
                  alt={country.code}
                  className="w-5 h-4 rounded-sm"
                />
                <span className="text-gray-900 dark:text-white">
                  {country.translatedName}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {country.code}
                </span>
              </button>
            ))
          ) : countries.length === 0 && !searchTerm ? (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
              暂无可用国家
            </div>
          ) : searchTerm ? (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
              未找到匹配的国家
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
