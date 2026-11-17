export type TravelStyle = "budget" | "moderate" | "luxury";

export interface CategoryRates {
  accommodation: number;
  food: number;
  localTransport: number;
  activities: number;
}

export interface CountryCostProfile {
  countryName: string;
  currency: string;
  intercityTransportDomestic: number; // in local currency
  rates: Record<TravelStyle, CategoryRates>;
  isGeneric?: boolean;
}

// Built-in country cost profiles mapped by lowercase country name & common synonyms
export const COUNTRY_COST_PROFILES: Record<string, CountryCostProfile> = {
  india: {
    countryName: "India",
    currency: "INR",
    intercityTransportDomestic: 2500,
    rates: {
      budget: {
        accommodation: 800,
        food: 700,
        localTransport: 300,
        activities: 500,
      },
      moderate: {
        accommodation: 1800,
        food: 1400,
        localTransport: 700,
        activities: 1200,
      },
      luxury: {
        accommodation: 5000,
        food: 3500,
        localTransport: 1800,
        activities: 3500,
      },
    },
  },
  japan: {
    countryName: "Japan",
    currency: "JPY",
    intercityTransportDomestic: 15000,
    rates: {
      budget: {
        accommodation: 5500,
        food: 3500,
        localTransport: 1200,
        activities: 2000,
      },
      moderate: {
        accommodation: 15000,
        food: 7000,
        localTransport: 2500,
        activities: 4500,
      },
      luxury: {
        accommodation: 38000,
        food: 18000,
        localTransport: 6000,
        activities: 12000,
      },
    },
  },
  thailand: {
    countryName: "Thailand",
    currency: "THB",
    intercityTransportDomestic: 1800,
    rates: {
      budget: {
        accommodation: 600,
        food: 400,
        localTransport: 200,
        activities: 350,
      },
      moderate: {
        accommodation: 1800,
        food: 900,
        localTransport: 500,
        activities: 800,
      },
      luxury: {
        accommodation: 5000,
        food: 2400,
        localTransport: 1200,
        activities: 2500,
      },
    },
  },
  france: {
    countryName: "France",
    currency: "EUR",
    intercityTransportDomestic: 120,
    rates: {
      budget: {
        accommodation: 60,
        food: 35,
        localTransport: 15,
        activities: 20,
      },
      moderate: {
        accommodation: 150,
        food: 75,
        localTransport: 30,
        activities: 45,
      },
      luxury: {
        accommodation: 380,
        food: 180,
        localTransport: 75,
        activities: 120,
      },
    },
  },
  italy: {
    countryName: "Italy",
    currency: "EUR",
    intercityTransportDomestic: 110,
    rates: {
      budget: {
        accommodation: 55,
        food: 35,
        localTransport: 15,
        activities: 20,
      },
      moderate: {
        accommodation: 140,
        food: 70,
        localTransport: 30,
        activities: 45,
      },
      luxury: {
        accommodation: 350,
        food: 170,
        localTransport: 70,
        activities: 110,
      },
    },
  },
  "united states": {
    countryName: "United States",
    currency: "USD",
    intercityTransportDomestic: 160,
    rates: {
      budget: {
        accommodation: 80,
        food: 40,
        localTransport: 20,
        activities: 25,
      },
      moderate: {
        accommodation: 180,
        food: 85,
        localTransport: 35,
        activities: 55,
      },
      luxury: {
        accommodation: 420,
        food: 200,
        localTransport: 90,
        activities: 150,
      },
    },
  },
  usa: {
    countryName: "United States",
    currency: "USD",
    intercityTransportDomestic: 160,
    rates: {
      budget: {
        accommodation: 80,
        food: 40,
        localTransport: 20,
        activities: 25,
      },
      moderate: {
        accommodation: 180,
        food: 85,
        localTransport: 35,
        activities: 55,
      },
      luxury: {
        accommodation: 420,
        food: 200,
        localTransport: 90,
        activities: 150,
      },
    },
  },
  "united kingdom": {
    countryName: "United Kingdom",
    currency: "GBP",
    intercityTransportDomestic: 120,
    rates: {
      budget: {
        accommodation: 60,
        food: 35,
        localTransport: 18,
        activities: 20,
      },
      moderate: {
        accommodation: 140,
        food: 75,
        localTransport: 32,
        activities: 50,
      },
      luxury: {
        accommodation: 350,
        food: 180,
        localTransport: 75,
        activities: 130,
      },
    },
  },
  uk: {
    countryName: "United Kingdom",
    currency: "GBP",
    intercityTransportDomestic: 120,
    rates: {
      budget: {
        accommodation: 60,
        food: 35,
        localTransport: 18,
        activities: 20,
      },
      moderate: {
        accommodation: 140,
        food: 75,
        localTransport: 32,
        activities: 50,
      },
      luxury: {
        accommodation: 350,
        food: 180,
        localTransport: 75,
        activities: 130,
      },
    },
  },
  china: {
    countryName: "China",
    currency: "CNY",
    intercityTransportDomestic: 600,
    rates: {
      budget: {
        accommodation: 200,
        food: 100,
        localTransport: 40,
        activities: 60,
      },
      moderate: {
        accommodation: 500,
        food: 250,
        localTransport: 90,
        activities: 150,
      },
      luxury: {
        accommodation: 1300,
        food: 650,
        localTransport: 220,
        activities: 450,
      },
    },
  },
  egypt: {
    countryName: "Egypt",
    currency: "EGP",
    intercityTransportDomestic: 2000,
    rates: {
      budget: {
        accommodation: 700,
        food: 400,
        localTransport: 200,
        activities: 350,
      },
      moderate: {
        accommodation: 1800,
        food: 950,
        localTransport: 500,
        activities: 850,
      },
      luxury: {
        accommodation: 5000,
        food: 2500,
        localTransport: 1300,
        activities: 2800,
      },
    },
  },
  kenya: {
    countryName: "Kenya",
    currency: "KES",
    intercityTransportDomestic: 10000,
    rates: {
      budget: {
        accommodation: 4000,
        food: 2200,
        localTransport: 1200,
        activities: 1800,
      },
      moderate: {
        accommodation: 10000,
        food: 4800,
        localTransport: 2500,
        activities: 4500,
      },
      luxury: {
        accommodation: 28000,
        food: 12000,
        localTransport: 6500,
        activities: 14000,
      },
    },
  },
  australia: {
    countryName: "Australia",
    currency: "AUD",
    intercityTransportDomestic: 200,
    rates: {
      budget: {
        accommodation: 90,
        food: 50,
        localTransport: 25,
        activities: 30,
      },
      moderate: {
        accommodation: 200,
        food: 100,
        localTransport: 40,
        activities: 65,
      },
      luxury: {
        accommodation: 480,
        food: 230,
        localTransport: 100,
        activities: 160,
      },
    },
  },
};

// Generic international fallback when country profile is not explicitly cataloged
export const GENERIC_INTERNATIONAL_PROFILE: CountryCostProfile = {
  countryName: "International Destination",
  currency: "USD",
  intercityTransportDomestic: 150,
  rates: {
    budget: {
      accommodation: 70,
      food: 35,
      localTransport: 20,
      activities: 25,
    },
    moderate: {
      accommodation: 160,
      food: 80,
      localTransport: 35,
      activities: 50,
    },
    luxury: {
      accommodation: 380,
      food: 190,
      localTransport: 80,
      activities: 140,
    },
  },
  isGeneric: true,
};

