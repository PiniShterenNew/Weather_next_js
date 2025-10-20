'use client';

import { MapPin } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import WeatherList from "./Weatherlist";
import { useWeatherStore } from "@/store/useWeatherStore";
import { useTranslations } from "next-intl";

export default function OpenCitiesList() {
    const [open, setOpen] = useState(false);
    const { cities } = useWeatherStore();
    const t = useTranslations();
    
    // Determine if this tab should be active (when there are cities and weather is active)
    const isActive = cities.length > 0;
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="flex flex-col items-center justify-center py-2"
                    aria-label={t('navigation.cities')}
                >
                    <MapPin className={`h-6 w-6 mb-1 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} />
                    <span className={`text-xs ${isActive ? 'text-blue-500 font-medium' : 'text-gray-500'}`}>
                        {t('navigation.cities')}
                    </span>
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>רשימת ערים</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto">
                    <WeatherList />
                </div>
            </DialogContent>
        </Dialog>
    );
}
