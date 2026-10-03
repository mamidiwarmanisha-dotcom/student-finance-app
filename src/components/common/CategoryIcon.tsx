import React from 'react';
import {
  Utensils,
  Bus,
  Home,
  GraduationCap,
  BookOpen,
  Smile,
  MoreHorizontal,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const normalized = name.toLowerCase();

  if (normalized.includes('food') || normalized.includes('utensils')) {
    return <Utensils {...props} />;
  }
  if (normalized.includes('transport') || normalized.includes('bus') || normalized.includes('travel')) {
    return <Bus {...props} />;
  }
  if (normalized.includes('rent') || normalized.includes('home') || normalized.includes('housing')) {
    return <Home {...props} />;
  }
  if (normalized.includes('fees') || normalized.includes('college') || normalized.includes('graduation')) {
    return <GraduationCap {...props} />;
  }
  if (normalized.includes('books') || normalized.includes('study') || normalized.includes('bookopen')) {
    return <BookOpen {...props} />;
  }
  if (normalized.includes('fun') || normalized.includes('entertainment') || normalized.includes('smile')) {
    return <Smile {...props} />;
  }

  return <MoreHorizontal {...props} />;
};
