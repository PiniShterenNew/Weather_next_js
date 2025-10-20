import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import { getDirection } from '@/lib/intl';

interface City {
  name: string;
  country: string;
  temp?: string;
}

interface CityGridProps {
  cities: City[];
  onSelect: (city: City) => void;
  className?: string;
}

export default function CityGrid({ cities, onSelect, className = '' }: CityGridProps) {
  const locale = useLocale() as AppLocale;
  const direction = getDirection(locale);

  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${className}`}
      dir={direction}
    >
      {cities.map((city, index) => (
        <motion.div
          key={`${city.name}-${city.country}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.2,
            delay: index * 0.05,
            ease: 'easeOut'
          }}
        >
          <Card
            className="p-4 cursor-pointer hover:bg-accent/50 transition-all hover:scale-[1.02] group bg-background/80 backdrop-blur-sm"
            onClick={() => onSelect(city)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium group-hover:text-primary transition-colors">
                  {city.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {city.country}
                </div>
              </div>
              {city.temp && (
                <div className="text-lg font-medium">{city.temp}</div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
