'use client';

import React from 'react';
import { CityListItemProps } from '../types';
import { cn } from '@/lib/utils';

export default function CityListItem({
  city,
  onSelect,
  onRemove,
  isSelected = false,
  className
}: CityListItemProps) {
  const handleClick = () => {
    onSelect(city);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(city);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
        "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
        isSelected && "bg-muted/50 border-primary",
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {city.city.he || city.city.en}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {city.country.he || city.country.en}
        </div>
      </div>
      
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          className="ml-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
          aria-label={`Remove ${city.city.he || city.city.en}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
