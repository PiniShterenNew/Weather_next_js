'use client';

import { useWeatherStore } from '@/stores/useWeatherStore';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function TemporaryUnitToggle() {
  const t = useTranslations('unit');
  const unit = useWeatherStore((s) => s.unit);
  const setUnit = useWeatherStore((s) => s.setUnit);

  const toggle = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const unitLabel = unit === 'metric' ? t('celsius') : t('fahrenheit');

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label={unitLabel}
          tabIndex={-1}
          dir="ltr"
          title={unitLabel}
        >
          {unitLabel}
        </Button>
      </TooltipTrigger>
      <TooltipContent dir="ltr">{unitLabel}</TooltipContent>
    </Tooltip>
  );
}
