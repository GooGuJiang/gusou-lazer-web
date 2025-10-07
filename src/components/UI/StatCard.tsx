import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon?: React.ReactNode;
  delay?: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color,
  icon,
  delay = 0,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-card rounded-xl shadow-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white break-words">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div 
          className="p-3 rounded-lg ml-4 flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon || (
            <div 
              className="w-6 h-6 rounded"
              style={{ backgroundColor: color }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
