import React from 'react';
import type { Category } from '../../types/models';
import { CategoryIcon } from './CategoryIcon';

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onClick?: () => void;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  selected = false,
  onClick,
  showIcon = true,
  size = 'md',
}) => {
  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full font-medium transition-all select-none cursor-pointer border ${
        isSmall
          ? 'px-3 py-1.5 text-xs min-h-[36px]'
          : 'px-4 py-2 text-sm min-h-[44px]'
      } ${
        selected
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {showIcon && (
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{
            backgroundColor: selected ? 'rgba(255,255,255,0.25)' : `${category.color}20`,
            color: selected ? '#ffffff' : category.color,
          }}
        >
          <CategoryIcon name={category.icon || category.name} className="w-3.5 h-3.5" />
        </span>
      )}
      <span>{category.name}</span>
    </button>
  );
};
