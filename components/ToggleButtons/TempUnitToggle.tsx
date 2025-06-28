'use client';

import { useWeatherStore } from '@/stores/useWeatherStore';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function TemporaryUnitToggle() {
  const t = useTranslations('unit');
  const unit = useWeatherStore((s) => s.unit);
  const setUnit = useWeatherStore((s) => s.setUnit);

  const toggle = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const unitLabel = unit === 'metric' ? t('celsius') : t('fahrenheit');

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      dir="ltr"
      aria-label={`${t('toggle')} ${unitLabel}`}
    >
      {unitLabel}
    </Button>
  );
}
