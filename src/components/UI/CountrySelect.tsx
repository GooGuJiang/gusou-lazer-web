import React, { useState, useRef, useEffect } from 'react';

interface Country {
  code: string;
  name: string;
}

// 常见国家列表
const COMMON_COUNTRIES: Country[] = [
  { code: 'CN', name: '中国' },
  { code: 'US', name: '美国' },
  { code: 'JP', name: '日本' },
  { code: 'KR', name: '韩国' },
  { code: 'DE', name: '德国' },
  { code: 'GB', name: '英国' },
  { code: 'FR', name: '法国' },
  { code: 'CA', name: '加拿大' },
  { code: 'AU', name: '澳大利亚' },
  { code: 'RU', name: '俄罗斯' },
  { code: 'BR', name: '巴西' },
  { code: 'TW', name: '台湾' },
  { code: 'HK', name: '香港' },
  { code: 'SG', name: '新加坡' },
  { code: 'TH', name: '泰国' },
  { code: 'MY', name: '马来西亚' },
  { code: 'ID', name: '印度尼西亚' },
  { code: 'PH', name: '菲律宾' },
  { code: 'VN', name: '越南' },
  { code: 'IN', name: '印度' },
];

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  placeholder = "选择国家或输入国家代码"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = COMMON_COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

  const selectedCountry = COMMON_COUNTRIES.find(c => c.code === value);

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
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-card text-gray-900 dark:text-white shadow-sm min-h-[44px] sm:min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-sm sm:text-base"
          />
          
          {/* 国旗显示 */}
          {selectedCountry && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <img
                src={`/image/flag/${selectedCountry.code.toLowerCase()}.svg`}
                alt={selectedCountry.code}
                className="w-5 h-4 rounded-sm"
                title={selectedCountry.name}
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
        <div className="absolute z-50 w-full mt-1 bg-card border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredCountries.length > 0 ? (
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
                  {country.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {country.code}
                </span>
              </button>
            ))
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
