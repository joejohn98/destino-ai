import type mongoose from "mongoose";
import {
  calculateTransitCostInr,
  getCountryCostProfile,
  getDailyRatesInInr,
  type TravelStyle,
} from "./cost-profile.service";
import {
  convertToInr,
  formatCurrency,
  formatInr,
} from "./currency.service";

export interface PopulatedDestination {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  location?: {
    city?: string;
    state?: string;
    country?: {
      name?: string;
      slug?: string;
    } | null;
  };
}

export interface StopBreakdownItem {
  destinationId: string;
  name: string;
  country: string;
  days: number;
  dailyPerTravellerInr: number;
  dailyPerTravellerLocal: string;
  stopTotalInr: number;
  localCurrency: string;
}

export type BudgetLimitInput =
  | number
  | {
      amount: number;
      currency?: string;
    }
  | undefined;

export interface ParsedBudgetLimit {
  limitInInr: number;
  formattedLimit: string;
  originalAmount?: number;
  originalCurrency?: string;
}

/**
 * Parses and converts an optional budget limit into INR.
 */
export const parseBudgetLimit = (
  limit?: BudgetLimitInput,
): ParsedBudgetLimit | null => {
  if (limit === undefined || limit === null) return null;
  if (typeof limit === "number") {
    return {
      limitInInr: limit,
      formattedLimit: formatInr(limit),
      originalAmount: limit,
      originalCurrency: "INR",
    };
  }

  const curr = limit.currency || "INR";
  const conv = convertToInr(limit.amount, curr);
  const formattedLimit =
    conv.fromCurrency === "INR"
      ? formatInr(conv.amount)
      : `${formatInr(conv.amount)} (${formatCurrency(limit.amount, conv.fromCurrency)} at 1 ${conv.fromCurrency} = ₹${conv.exchangeRate})`;

  return {
    limitInInr: conv.amount,
    formattedLimit,
    originalAmount: limit.amount,
    originalCurrency: conv.fromCurrency,
  };
};

/**
 * Extracts country name safely from a populated destination.
 */
export const extractCountryName = (
  dest: PopulatedDestination,
): string | undefined => {
  const countryObj = dest.location?.country;
  if (
    typeof countryObj === "object" &&
    countryObj !== null &&
    "name" in countryObj &&
    typeof countryObj.name === "string"
  ) {
    return countryObj.name;
  }
  return undefined;
};

/**
 * Distributes total trip duration days across itinerary stops.
 */
export const allocateStopDays = (
  rawStops: Array<{ destinationId: string; days?: number }>,
  durationDays: number,
): Array<{ destinationId: string; days: number }> => {
  const allocatedStops = rawStops.map((stop) => ({
    ...stop,
    days: stop.days && stop.days > 0 ? stop.days : 0,
  }));

  const totalExplicitDays = allocatedStops.reduce((acc, s) => acc + s.days, 0);
  const stopsWithoutDays = allocatedStops.filter((s) => s.days === 0);

  if (stopsWithoutDays.length > 0) {
    const remainingDays = Math.max(
      stopsWithoutDays.length,
      durationDays - totalExplicitDays,
    );
    const basePerStop = Math.floor(remainingDays / stopsWithoutDays.length);
    let remainder = remainingDays % stopsWithoutDays.length;

    for (const s of stopsWithoutDays) {
      s.days = basePerStop + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    }
  } else if (totalExplicitDays !== durationDays) {
    const diff = durationDays - totalExplicitDays;
    const last = allocatedStops[allocatedStops.length - 1];
    if (last) {
      last.days = Math.max(1, last.days + diff);
    }
  }

  return allocatedStops;
};

export interface DestinationBudgetCalculationInput {
  destination: PopulatedDestination;
  durationDays: number;
  travellers: number;
  travelStyle: TravelStyle;
  budgetLimit?: BudgetLimitInput | undefined;
}

/**
 * Calculates budget for a single destination independently.
 */
export const calculateDestinationBudget = ({
  destination,
  durationDays,
  travellers,
  travelStyle,
  budgetLimit,
}: DestinationBudgetCalculationInput) => {
  const countryName = extractCountryName(destination);
  const profile = getCountryCostProfile(countryName);
  const rates = getDailyRatesInInr(countryName, travelStyle);

  const totalAccommodationInr =
    rates.accommodationInr * durationDays * travellers;
  const totalFoodInr = rates.foodInr * durationDays * travellers;
  const totalTransportInr = rates.localTransportInr * durationDays * travellers;
  const totalActivitiesInr = rates.activitiesInr * durationDays * travellers;

  const totalCostInr =
    totalAccommodationInr +
    totalFoodInr +
    totalTransportInr +
    totalActivitiesInr;

  const perPersonCostInr = Math.round(totalCostInr / travellers);
  const localDailyTotal = rates.localDailyTotal;
  const totalLocalCost = localDailyTotal * durationDays * travellers;

  const parsedLimit = parseBudgetLimit(budgetLimit);

  const assumptions: string[] = [
    `Destination: ${destination.name} (${profile.countryName}).`,
    `Cost rates are based on ${profile.countryName} local economy in ${profile.currency} and converted to INR at 1 ${profile.currency} = ₹${rates.conversion.exchangeRate} (as of ${rates.conversion.rateDate}).`,
    `Daily local spend per traveller: ${formatCurrency(localDailyTotal, profile.currency)} (approx. ${formatInr(rates.dailyTotalInr)}).`,
    "Includes accommodation, food, local city transport, and standard activities.",
    "Excludes international flights, visas, travel insurance, shopping, and discretionary expenses.",
    "Single destination estimate: no intercity transit charge is included.",
  ];

  if (profile.isGeneric) {
    assumptions.push(
      "Note: Exact local data for this country was unavailable; a standard international cost profile was applied.",
    );
  }

  return {
    destination: {
      id: String(destination._id),
      name: destination.name,
      city: destination.location?.city,
      country: profile.countryName,
    },
    currency: "INR",
    localCurrency: profile.currency,
    durationDays,
    travellers,
    travelStyle,
    dailyPerTravellerInr: rates.dailyTotalInr,
    dailyPerTravellerInrFormatted: formatInr(rates.dailyTotalInr),
    dailyPerTravellerLocalFormatted: formatCurrency(
      localDailyTotal,
      profile.currency,
    ),
    totalEstimatedCost: totalCostInr,
    totalEstimatedCostFormatted: formatInr(totalCostInr),
    totalLocalEstimatedCostFormatted: formatCurrency(
      totalLocalCost,
      profile.currency,
    ),
    perPersonCost: perPersonCostInr,
    perPersonCostFormatted: formatInr(perPersonCostInr),
    breakdown: {
      accommodation: formatInr(totalAccommodationInr),
      food: formatInr(totalFoodInr),
      localTransport: formatInr(totalTransportInr),
      activities: formatInr(totalActivitiesInr),
    },
    budgetStatus:
      parsedLimit === null
        ? ("not-provided" as const)
        : totalCostInr <= parsedLimit.limitInInr
          ? ("within-budget" as const)
          : ("over-budget" as const),
    budgetLimit: parsedLimit?.formattedLimit ?? null,
    exchangeRate: {
      currency: profile.currency,
      toInrRate: rates.conversion.exchangeRate,
      rateDate: rates.conversion.rateDate,
    },
    assumptions,
  };
};

export interface TripBudgetCalculationInput {
  rawStops: Array<{ destinationId: string; days?: number }>;
  destinations: PopulatedDestination[];
  durationDays: number;
  travellers: number;
  travelStyle: TravelStyle;
  budgetLimit?: BudgetLimitInput | undefined;
}

/**
 * Calculates budget for a multi-stop or single itinerary trip.
 */
export const calculateTripBudget = ({
  rawStops,
  destinations,
  durationDays,
  travellers,
  travelStyle,
  budgetLimit,
}: TripBudgetCalculationInput) => {
  const foundMap = new Map(destinations.map((d) => [String(d._id), d]));
  const allocatedStops = allocateStopDays(rawStops, durationDays);

  let totalAccommodationInr = 0;
  let totalFoodInr = 0;
  let totalLocalTransportInr = 0;
  let totalActivitiesInr = 0;

  const stopsBreakdown: StopBreakdownItem[] = [];
  const countriesVisited = new Set<string>();

  for (const stop of allocatedStops) {
    const dest = foundMap.get(stop.destinationId);
    if (!dest) continue;
    const countryName = extractCountryName(dest);
    const profile = getCountryCostProfile(countryName);
    countriesVisited.add(profile.countryName);

    const rates = getDailyRatesInInr(countryName, travelStyle);
    const stopDays = stop.days;

    const acc = rates.accommodationInr * stopDays * travellers;
    const food = rates.foodInr * stopDays * travellers;
    const trans = rates.localTransportInr * stopDays * travellers;
    const act = rates.activitiesInr * stopDays * travellers;
    const stopTotalInr = acc + food + trans + act;

    totalAccommodationInr += acc;
    totalFoodInr += food;
    totalLocalTransportInr += trans;
    totalActivitiesInr += act;

    stopsBreakdown.push({
      destinationId: stop.destinationId,
      name: dest.name,
      country: profile.countryName,
      days: stopDays,
      dailyPerTravellerInr: rates.dailyTotalInr,
      dailyPerTravellerLocal: formatCurrency(
        rates.localDailyTotal,
        profile.currency,
      ),
      stopTotalInr,
      localCurrency: profile.currency,
    });
  }

  // Calculate intercity / transit costs between consecutive stops
  let intercityTotalInr = 0;
  const transitLegs: string[] = [];

  for (let i = 0; i < allocatedStops.length - 1; i++) {
    const fromStop = allocatedStops[i];
    const toStop = allocatedStops[i + 1];
    if (!fromStop || !toStop) continue;

    const fromDest = foundMap.get(fromStop.destinationId);
    const toDest = foundMap.get(toStop.destinationId);
    if (!fromDest || !toDest) continue;

    const transit = calculateTransitCostInr(
      extractCountryName(fromDest),
      extractCountryName(toDest),
      travelStyle,
      travellers,
    );

    intercityTotalInr += transit.costInr;
    transitLegs.push(
      `${fromDest.name} → ${toDest.name}: ${transit.description}`,
    );
  }

  const dailyTotalInr =
    totalAccommodationInr +
    totalFoodInr +
    totalLocalTransportInr +
    totalActivitiesInr;

  const grandTotalInr = dailyTotalInr + intercityTotalInr;
  const perPersonCostInr = Math.round(grandTotalInr / travellers);

  const parsedLimit = parseBudgetLimit(budgetLimit);

  const assumptions: string[] = [
    `Estimates use destination-specific daily rates for ${travelStyle} style across ${countriesVisited.size} country/countries: ${[...countriesVisited].join(", ")}.`,
    "Includes accommodation, food, local transport, activities, and intercity connections between stops.",
    "Flights from home country, visas, shopping, and unusual seasonal surcharges are not included.",
  ];

  if (transitLegs.length > 0) {
    assumptions.push(...transitLegs.map((t) => `Transit: ${t}`));
  } else {
    assumptions.push(
      "Single-destination itinerary: no intercity transit charge included.",
    );
  }

  return {
    currency: "INR",
    travelStyle,
    destinations: destinations.map((destination) => ({
      id: String(destination._id),
      name: destination.name,
      country: extractCountryName(destination) ?? "Domestic/International",
    })),
    durationDays,
    travellers,
    totalEstimatedCost: grandTotalInr,
    totalEstimatedCostFormatted: formatInr(grandTotalInr),
    perPersonCost: perPersonCostInr,
    perPersonCostFormatted: formatInr(perPersonCostInr),
    breakdown: {
      accommodation: formatInr(totalAccommodationInr),
      food: formatInr(totalFoodInr),
      localTransport: formatInr(totalLocalTransportInr),
      activities: formatInr(totalActivitiesInr),
      intercityTransport: formatInr(intercityTotalInr),
    },
    stopsBreakdown,
    budgetStatus:
      parsedLimit === null
        ? ("not-provided" as const)
        : grandTotalInr <= parsedLimit.limitInInr
          ? ("within-budget" as const)
          : ("over-budget" as const),
    budgetLimit: parsedLimit?.formattedLimit ?? null,
    assumptions,
  };
};
