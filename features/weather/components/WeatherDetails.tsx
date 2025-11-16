import type { CSSProperties } from "react";
import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Droplets, Wind, Gauge, Sunrise, Sunset, Eye, Cloud, Sun, CloudRain } from "lucide-react";

import { formatTimeWithTimezone, getWindDirection, getUVIndexInfo } from "@/lib/helpers";
import { colors, spacing, borderRadius, shadows, typography, iconSizes } from "@/config/tokens";
import { useAppPreferencesStore } from "@/store/useAppPreferencesStore";
import type { CityWeatherCurrent } from "@/types/weather";
import type { AppLocale } from "@/types/i18n";

interface WeatherDetailsProps {
  cityLocale: CityWeatherCurrent;
  _locale: AppLocale;
}

interface WeatherMetricCard {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: string;
  label: string;
  value: string;
  unit?: string;
  description?: string;
  ariaLabel: string;
}

const baseCardStyle: CSSProperties = {
  padding: spacing[4],
  borderRadius: borderRadius.xl,
  background: colors.background.elevated,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.sm,
  gap: spacing[2],
};

const getCardStyle = (accent: string): CSSProperties => ({
  ...baseCardStyle,
  borderColor: accent,
  boxShadow: `${shadows.sm}, 0 0 0 1px ${accent}`,
});

const getIconStyle = (accent: string): CSSProperties => ({
  color: accent,
  width: iconSizes.lg,
  height: iconSizes.lg,
});

const valueStyle: CSSProperties = {
  fontSize: typography.fontSize["2xl"],
  fontWeight: Number(typography.fontWeight.semibold),
  color: colors.foreground.primary,
  display: "flex",
  alignItems: "baseline",
  gap: spacing[1],
};

const labelStyle: CSSProperties = {
  fontSize: typography.fontSize.xs,
  fontWeight: Number(typography.fontWeight.medium),
  color: colors.foreground.muted,
};

const descriptionStyle = (accent: string): CSSProperties => ({
  fontSize: typography.fontSize.xs,
  fontWeight: Number(typography.fontWeight.medium),
  color: accent,
});

const gridStyle: CSSProperties = {
  gap: spacing[3],
};

const secondaryGridStyle: CSSProperties = {
  marginTop: spacing[4],
  gap: spacing[3],
};

export default function WeatherDetails({ cityLocale, _locale }: WeatherDetailsProps) {
  const t = useTranslations();
  const currentUnit = useAppPreferencesStore((state) => state.unit);

  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(_locale, { maximumFractionDigits: 1, minimumFractionDigits: 0 }),
    [_locale],
  );

  const integerFormatter = useMemo(
    () => new Intl.NumberFormat(_locale, { maximumFractionDigits: 0 }),
    [_locale],
  );

  const fallbackLabel = t("common.notAvailable");
  const buildAriaLabel = (metric: string, value: string, unit?: string) => {
    const valueText = value === "--" ? fallbackLabel : unit ? `${value} ${unit}` : value;
    return t("aria.weatherDetailsCard", { metric, value: valueText });
  };

  const humidityValue = cityLocale.current.humidity;
  const humidityFormatted =
    humidityValue !== null && humidityValue !== undefined && !Number.isNaN(humidityValue)
      ? integerFormatter.format(humidityValue)
      : "--";
  const humidityUnit = humidityFormatted !== "--" ? t("units.percentageSymbol") : undefined;

  const windSpeedValue = cityLocale.current.wind;
  const windSpeedConverted =
    windSpeedValue !== null && windSpeedValue !== undefined
      ? currentUnit === "metric"
        ? numberFormatter.format(windSpeedValue)
        : numberFormatter.format(windSpeedValue * 0.621371)
      : "--";
  const windUnit =
    windSpeedConverted !== "--"
      ? currentUnit === "metric"
        ? t("units.windSpeed.metric")
        : t("units.windSpeed.imperial")
      : undefined;
  const windDirection =
    cityLocale.current.windDeg !== null && cityLocale.current.windDeg !== undefined
      ? getWindDirection(cityLocale.current.windDeg)
      : undefined;
  const windDescription =
    windDirection && windUnit
      ? t("weather.directionDescription", { direction: windDirection })
      : undefined;

  const pressureValue = cityLocale.current.pressure;
  const pressureFormatted =
    pressureValue !== null && pressureValue !== undefined
      ? integerFormatter.format(pressureValue)
      : "--";
  const pressureUnit = pressureFormatted !== "--" ? t("units.pressure") : undefined;

  const visibilityValue = cityLocale.current.visibility;
  let visibilityFormatted = "--";
  let visibilityUnit: string | undefined;
  if (visibilityValue !== null && visibilityValue !== undefined) {
    if (visibilityValue >= 1000) {
      visibilityFormatted = numberFormatter.format(visibilityValue / 1000);
      visibilityUnit = t("units.distance.kilometers");
    } else {
      visibilityFormatted = integerFormatter.format(visibilityValue);
      visibilityUnit = t("units.distance.meters");
    }
  }

  const cloudsValue = cityLocale.current.clouds;
  const cloudsFormatted =
    cloudsValue !== null && cloudsValue !== undefined
      ? integerFormatter.format(cloudsValue)
      : "--";
  const cloudsUnit = cloudsFormatted !== "--" ? t("units.percentageSymbol") : undefined;

  const rainProbability = cityLocale.current.rainProbability;
  const rainFormatted =
    rainProbability !== null && rainProbability !== undefined
      ? integerFormatter.format(Math.round(rainProbability * 100))
      : "--";
  const rainUnit = rainFormatted !== "--" ? t("units.percentageSymbol") : undefined;

  const uvIndex = cityLocale.current.uvIndex;
  const uvFormatted =
    uvIndex !== null && uvIndex !== undefined ? numberFormatter.format(uvIndex) : "--";
  const uvInfo = uvIndex !== null && uvIndex !== undefined ? getUVIndexInfo(uvIndex) : undefined;
  const uvDescription = uvInfo ? t(`weather.uv.risk.${uvInfo.risk}`) : undefined;

  const sunriseTime =
    cityLocale.current.sunrise !== null && cityLocale.current.sunrise !== undefined
      ? formatTimeWithTimezone(cityLocale.current.sunrise, cityLocale.current.timezone)
      : "--:--";

  const sunsetTime =
    cityLocale.current.sunset !== null && cityLocale.current.sunset !== undefined
      ? formatTimeWithTimezone(cityLocale.current.sunset, cityLocale.current.timezone)
      : "--:--";

  const cards: WeatherMetricCard[] = [
    {
      id: "humidity",
      icon: Droplets,
      accent: colors.ui.humidity,
      label: t("humidity"),
      value: humidityFormatted,
      unit: humidityUnit,
      ariaLabel: buildAriaLabel(t("humidity"), humidityFormatted, humidityUnit),
    },
    {
      id: "wind",
      icon: Wind,
      accent: colors.ui.wind,
      label: t("wind"),
      value: windSpeedConverted,
      unit: windUnit,
      description: windDescription,
      ariaLabel: buildAriaLabel(
        t("wind"),
        windSpeedConverted,
        windUnit ? `${windUnit} ${windDirection ?? ""}`.trim() : undefined,
      ),
    },
    {
      id: "pressure",
      icon: Gauge,
      accent: colors.weather.cloudy,
      label: t("pressure"),
      value: pressureFormatted,
      unit: pressureUnit,
      ariaLabel: buildAriaLabel(t("pressure"), pressureFormatted, pressureUnit),
    },
    {
      id: "visibility",
      icon: Eye,
      accent: colors.weather.foggy,
      label: t("visibility"),
      value: visibilityFormatted,
      unit: visibilityUnit,
      ariaLabel: buildAriaLabel(t("visibility"), visibilityFormatted, visibilityUnit),
    },
    {
      id: "clouds",
      icon: Cloud,
      accent: colors.weather.cloudy,
      label: t("clouds"),
      value: cloudsFormatted,
      unit: cloudsUnit,
      ariaLabel: buildAriaLabel(t("clouds"), cloudsFormatted, cloudsUnit),
    },
    {
      id: "rainProbability",
      icon: CloudRain,
      accent: colors.weather.rainy,
      label: t("rainProbability"),
      value: rainFormatted,
      unit: rainUnit,
      ariaLabel: buildAriaLabel(t("rainProbability"), rainFormatted, rainUnit),
    },
    {
      id: "uvIndex",
      icon: Sun,
      accent: colors.weather.sunny,
      label: t("uvIndex"),
      value: uvFormatted,
      description: uvDescription,
      ariaLabel: buildAriaLabel(
        t("uvIndex"),
        uvFormatted,
        uvDescription ? `(${uvDescription})` : undefined,
      ),
    },
  ];

  return (
    <div data-testid="temperature" style={{ width: "100%" }}>
      <div
        className="grid grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label={t("aria.weatherDetailsGroup")}
        style={gridStyle}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex flex-col items-center text-center hover-lift animate-fade-in"
            role="listitem"
            aria-label={card.ariaLabel}
            style={getCardStyle(card.accent)}
          >
            <card.icon aria-hidden="true" style={getIconStyle(card.accent)} />
            <p style={valueStyle}>
              {card.value}
              {card.unit ? <span>{card.unit}</span> : null}
            </p>
            <p style={labelStyle}>{card.label}</p>
            {card.description ? <p style={descriptionStyle(card.accent)}>{card.description}</p> : null}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:hidden" style={secondaryGridStyle}>
        <div
          className="flex flex-col items-center text-center hover-lift animate-fade-in"
          role="region"
          aria-label={t("aria.sunriseTime", { time: sunriseTime === "--:--" ? fallbackLabel : sunriseTime })}
          style={getCardStyle(colors.ui.sunrise)}
        >
          <Sunrise aria-hidden="true" style={getIconStyle(colors.ui.sunrise)} />
          <p style={valueStyle} dir="ltr">
            <span>{sunriseTime}</span>
          </p>
          <p style={labelStyle}>{t("sunrise")}</p>
        </div>

        <div
          className="flex flex-col items-center text-center hover-lift animate-fade-in"
          role="region"
          aria-label={t("aria.sunsetTime", { time: sunsetTime === "--:--" ? fallbackLabel : sunsetTime })}
          style={getCardStyle(colors.ui.sunset)}
        >
          <Sunset aria-hidden="true" style={getIconStyle(colors.ui.sunset)} />
          <p style={valueStyle} dir="ltr">
            <span>{sunsetTime}</span>
          </p>
          <p style={labelStyle}>{t("sunset")}</p>
        </div>
      </div>
    </div>
  );
}
