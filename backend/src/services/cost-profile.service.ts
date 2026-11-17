import {
  COUNTRY_COST_PROFILES,
  GENERIC_INTERNATIONAL_PROFILE,
  type CategoryRates,
  type CountryCostProfile,
  type TravelStyle,
} from "../config/country-cost-profiles";
import {
  convertToInr,
  formatCurrency,
  formatInr,
  type ConvertedCurrencyResult,
} from "./currency.service";

export type { TravelStyle, CategoryRates, CountryCostProfile };

/**
 * Resolves the cost profile for a given country name or slug.
 */
export const getCountryCostProfile = (
  countryNameOrSlug?: string,
): CountryCostProfile => {
  const indiaProfile =
    COUNTRY_COST_PROFILES.india ?? GENERIC_INTERNATIONAL_PROFILE;
  if (!countryNameOrSlug || typeof countryNameOrSlug !== "string") {
    return indiaProfile;
  }

  const key = countryNameOrSlug.trim().toLowerCase();
  const directMatch = COUNTRY_COST_PROFILES[key];
  if (directMatch) {
    return directMatch;
  }

  // Check partial key matching
  const match = Object.keys(COUNTRY_COST_PROFILES).find(
    (k) => key.includes(k) || k.includes(key),
  );
  if (match && COUNTRY_COST_PROFILES[match]) {
    return COUNTRY_COST_PROFILES[match]!;
  }

  return {
    ...GENERIC_INTERNATIONAL_PROFILE,
    countryName: countryNameOrSlug,
  };
};

export interface CalculatedDailyRatesInr {
  accommodationInr: number;
  foodInr: number;
  localTransportInr: number;
  activitiesInr: number;
  dailyTotalInr: number;
  localCurrency: string;
  localDailyTotal: number;
  conversion: ConvertedCurrencyResult;
}

/**
 * Calculates daily rates converted to INR for a specific country and travel style.
 */
export const getDailyRatesInInr = (
  countryName: string | undefined,
  style: TravelStyle,
): CalculatedDailyRatesInr => {
  const profile = getCountryCostProfile(countryName);
  const catRates = profile.rates[style];
  const localDailyTotal =
    catRates.accommodation +
    catRates.food +
    catRates.localTransport +
    catRates.activities;

  const accConv = convertToInr(catRates.accommodation, profile.currency);
  const foodConv = convertToInr(catRates.food, profile.currency);
  const transConv = convertToInr(catRates.localTransport, profile.currency);
  const actConv = convertToInr(catRates.activities, profile.currency);
  const totalConv = convertToInr(localDailyTotal, profile.currency);

  return {
    accommodationInr: accConv.amount,
    foodInr: foodConv.amount,
    localTransportInr: transConv.amount,
    activitiesInr: actConv.amount,
    dailyTotalInr:
      accConv.amount + foodConv.amount + transConv.amount + actConv.amount,
    localCurrency: profile.currency,
    localDailyTotal,
    conversion: totalConv,
  };
};

/**
 * Calculates intercity transit cost between consecutive stops.
 */
export const calculateTransitCostInr = (
  fromCountryName: string | undefined,
  toCountryName: string | undefined,
  style: TravelStyle,
  travellers: number,
): { costInr: number; isCrossBorder: boolean; description: string } => {
  const fromProfile = getCountryCostProfile(fromCountryName);
  const toProfile = getCountryCostProfile(toCountryName);

  const styleMultiplier =
    style === "luxury" ? 2.2 : style === "budget" ? 0.7 : 1.0;

  if (
    fromProfile.countryName.toLowerCase() ===
    toProfile.countryName.toLowerCase()
  ) {
    // Domestic transit inside the country
    const localCost =
      fromProfile.intercityTransportDomestic * styleMultiplier * travellers;
    const conv = convertToInr(localCost, fromProfile.currency);
    return {
      costInr: conv.amount,
      isCrossBorder: false,
      description: `Domestic intercity transit within ${fromProfile.countryName} (${formatCurrency(localCost, fromProfile.currency)} ≈ ${formatInr(conv.amount)})`,
    };
  }

  // Cross-border international transit (flights/high-speed rail)
  const baseInternationalInrPerPerson =
    style === "luxury" ? 35000 : style === "budget" ? 12000 : 20000;
  const totalInr = baseInternationalInrPerPerson * travellers;

  return {
    costInr: totalInr,
    isCrossBorder: true,
    description: `Cross-border transit from ${fromProfile.countryName} to ${toProfile.countryName} (est. ${formatInr(totalInr)} for ${travellers} traveller${travellers > 1 ? "s" : ""})`,
  };
};
