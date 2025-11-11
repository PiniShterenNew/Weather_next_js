'use client';

import { useEffect, useId, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getDirection } from '@/lib/intl';
import { useQuickAddStore } from '@/features/search/store/useQuickAddStore';
import type { AppLocale } from '@/types/i18n';

import { RecentSearches } from '../RecentSearches';
import SearchBar from '../SearchBar';
import AddLocation from './AddLocation';
import PopularCities from './PopularCities';

interface QuickCityAddModalProps {
  titleTranslationKey?: string;
}

const QuickCityAddModal = ({ titleTranslationKey = 'search.quickAdd' }: QuickCityAddModalProps) => {
  const t = useTranslations();
  const { isOpen, setOpen } = useQuickAddStore();
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);
  const titleId = useId();
  const descriptionId = useId();
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('[data-dialog-content="true"]')) return;
      previouslyFocusedElement.current = target;
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const target = previouslyFocusedElement.current;
      if (target && document.contains(target)) {
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => {
            target.focus({ preventScroll: true });
            previouslyFocusedElement.current = null;
          });
        } else {
          target.focus({ preventScroll: true });
          previouslyFocusedElement.current = null;
        }
      }
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="max-h-[90vh] overflow-y-auto bg-white p-0 text-neutral-900 dark:bg-gray-900 dark:text-white"
        dir={direction}
      >
        <DialogHeader className="relative gap-2 px-6 pb-4 pt-6 sm:px-8">
          <DialogTitle id={titleId} className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t(titleTranslationKey)}
          </DialogTitle>
          <DialogDescription id={descriptionId} className="text-sm text-muted-foreground">
            {t('search.addCityDescription')}
          </DialogDescription>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute end-4 top-4 h-10 w-10 text-muted-foreground hover:text-foreground sm:end-6 sm:top-6"
              aria-label={t('common.close')}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-5 px-6 pb-6 sm:px-8">
          <div className="relative">
            <SearchBar
              onSelect={() => {
                setOpen(false);
              }}
            />
          </div>

          <RecentSearches
            onSelect={() => {
              setOpen(false);
            }}
          />

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white sm:text-lg">
              {t('search.popularCities')}
            </h3>
            <PopularCities direction={direction} />
          </div>

          <AddLocation size="lg" type="default" dataTestId="quick-add-current-location" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickCityAddModal;


