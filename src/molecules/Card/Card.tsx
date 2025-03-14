import React from 'react';
import {cn} from '../../utils/helpers/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({children, className}: CardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-md overflow-hidden",
      className
    )}>
      {children}
    </div>
  );
}