import { useState, useCallback } from 'react';
import type { CitySuggestion } from '@/types/suggestion';

export interface UseSearchKeyboardReturn {
  selectedIndex: number;
  handleKeyDown: (e: React.KeyboardEvent, suggestions: CitySuggestion[], onSelect: (city: CitySuggestion) => void, inputRef: React.RefObject<HTMLInputElement>, showDropdown: boolean, setShowDropdown: (show: boolean) => void) => void;
  setSelectedIndex: (index: number) => void;
}

export function useSearchKeyboard(): UseSearchKeyboardReturn {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = useCallback((
    e: React.KeyboardEvent,
    suggestions: CitySuggestion[],
    onSelect: (city: CitySuggestion) => void,
    inputRef: React.RefObject<HTMLInputElement>,
    showDropdown: boolean,
    setShowDropdown: (show: boolean) => void
  ) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          onSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  }, [selectedIndex]);

  return {
    selectedIndex,
    handleKeyDown,
    setSelectedIndex
  };
}

