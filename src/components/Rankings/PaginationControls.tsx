import { type ReactNode } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Props {
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({ total, currentPage, onPageChange }: Props) {
  const totalPages = Math.ceil(total / 50);
  if (totalPages <= 1) return null;

  const pages: ReactNode[] = [];
  const maxVisiblePages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (currentPage > 1) {
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 rounded-lg bg-card border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
      >
        <FiChevronLeft size={18} />
      </button>
    );
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          i === currentPage
            ? 'bg-osu-pink text-white border border-osu-pink'
            : 'bg-card border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        {i}
      </button>
    );
  }

  if (currentPage < totalPages) {
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 rounded-lg bg-card border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
      >
        <FiChevronRight size={18} />
      </button>
    );
  }

  return <div className="flex items-center justify-center gap-2 mt-8 px-4 sm:px-0">{pages}</div>;
}
