// components/QuickAdd/QuickCityAddModal.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { AppLocale } from '@/types/i18n';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { MapPin, Plus, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { getDirection } from '@/lib/intl';
import PopularCities from './PopularCities';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherStore } from '@/stores/useWeatherStore';

export function QuickCityAddModal() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const { open, setOpen } = useWeatherStore();
  const [activeTab, setActiveTab] = useState<'popular' | 'search'>('popular');
  const direction = getDirection(locale);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          data-testid="quick-add-button"
          title={t('search.quickAdd')}
          className="gap-2 rounded-full shadow-sm hover:shadow transition-all"
          asChild
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ rotate: open ? 45 : 0, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex"
            >
              <Plus className="h-4 w-4" />
            </motion.div>
            {t('search.quickAdd')}
          </motion.button>
        </Button>
      </DialogTrigger>

      <AnimatePresence>
        {open && (
          <DialogContent className="w-full max-w-5xl max-h-[85vh] min-h-[500px] p-0 overflow-hidden flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="p-6 pb-2 shrink-0">
                <DialogTitle className="text-xl">{t('search.addCity')}</DialogTitle>
                <DialogDescription>{t('search.addCityDescription')}</DialogDescription>
              </DialogHeader>
            </motion.div>

            <Tabs
              defaultValue="popular"
              value={activeTab}
              role='tablist'
              onValueChange={(value) => setActiveTab(value as 'popular' | 'search')}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <TabsList className="h-16 gap-2 mx-6 mb-6 p-1.5 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 rounded-2xl border border-muted/40 backdrop-blur-md shrink-0" dir={direction}>
                  <TabsTrigger
                    value="popular"
                    data-testid="tab-popular"
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-base 
                               data-[state=active]:bg-gradient-to-r data-[state=active]:from-background data-[state=active]:to-background/95 
                               data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30
                               data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
                               data-[state=inactive]:hover:bg-background/40 transition-all duration-300"
                  >
                    <motion.div
                      animate={{
                        rotate: activeTab === 'popular' ? 360 : 0,
                        scale: activeTab === 'popular' ? 1.1 : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Star className="h-4 w-4" />
                    </motion.div>
                    <span className="whitespace-nowrap text-sm">{t('search.popularCities')}</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="search"
                    data-testid="tab-search"
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-base 
                               data-[state=active]:bg-gradient-to-r data-[state=active]:from-background data-[state=active]:to-background/95 
                               data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30
                               data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground
                               data-[state=inactive]:hover:bg-background/40 transition-all duration-300"
                  >
                    <motion.div
                      animate={{
                        y: activeTab === 'search' ? [-2, 2, -2] : 0,
                        scale: activeTab === 'search' ? 1.1 : 1
                      }}
                      transition={{
                        y: { repeat: activeTab === 'search' ? Infinity : 0, duration: 1.5 },
                        scale: { duration: 0.3 }
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                    </motion.div>
                    <span className="whitespace-nowrap text-sm">{t('search.searchCity')}</span>
                  </TabsTrigger>
                </TabsList>
              </motion.div>

              <AnimatePresence mode="wait">
                <TabsContent
                  key="popular"
                  value="popular"
                  className="flex-1 px-6 pb-6 m-0 flex flex-col overflow-hidden"
                  dir="rtl"
                >
                  <motion.div
                    initial={{ opacity: 0, x: activeTab === 'popular' ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                  >
                    <Card className="flex-1 border rounded-lg overflow-hidden">
                      <div className="h-full overflow-y-auto p-3">
                        <PopularCities direction={direction} color="default" />
                      </div>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent
                  key="search"
                  value="search"
                  className="flex-1 px-6 pb-6 m-0 flex flex-col justify-start overflow-hidden"
                  dir={direction}
                >
                  <motion.div
                    initial={{ opacity: 0, x: activeTab === 'search' ? 50 : -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col"
                  >
                    <motion.div
                      className="mb-4 shrink-0 p-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <SearchBar onSelect={() => {
                        setOpen(false);
                      }} />
                    </motion.div>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}