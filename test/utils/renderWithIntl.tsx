// /test/utils/renderWithIntl.tsx
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { render as rtlRender } from '@testing-library/react';
import type { Messages } from 'next-intl';
import en from '../../locales/en.json';
import { TooltipProvider } from '../../components/ui/tooltip';
import { ThemeAndDirectionProvider } from '../../providers/ThemeAndDirectionProvider';

type Options = {
  locale?: string;
  messages?: Messages;
};

export function render(
  ui: React.ReactElement,
  { locale = 'en', messages = en }: Options = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <TooltipProvider delayDuration={0}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeAndDirectionProvider locale={locale}>
            {children}
          </ThemeAndDirectionProvider>
        </NextIntlClientProvider>
      </TooltipProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper });
}

export * from '@testing-library/react';
