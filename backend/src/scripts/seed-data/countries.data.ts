import type mongoose from "mongoose";

export interface CountrySeedInput {
  name: string;
  description: string;
  imageUrl: string;
  continentName: string;
}

export const rawCountriesData: CountrySeedInput[] = [
  {
    name: "Egypt",
    description: "Land of pharaohs, pyramids and the mighty Nile River.",
    imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368",
    continentName: "Africa",
  },
  {
    name: "Kenya",
    description: "Home of the Great Migration and the Big Five.",
    imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801",
    continentName: "Africa",
  },
  {
    name: "India",
    description:
      "A subcontinent of immense diversity, spirituality and colour.",
    imageUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
    continentName: "Asia",
  },
  {
    name: "Japan",
    description:
      "A seamless blend of ancient tradition and futuristic innovation.",
    imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
    continentName: "Asia",
  },
  {
    name: "China",
    description:
      "One of the world's oldest civilizations, home to iconic landmarks.",
    imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d",
    continentName: "Asia",
  },
  {
    name: "France",
    description: "Land of art, cuisine, fashion and the Eiffel Tower.",
    imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    continentName: "Europe",
  },
  {
    name: "Italy",
    description:
      "A living museum of history, Renaissance art and world-class food.",
    imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963",
    continentName: "Europe",
  },
  {
    name: "United States",
    description:
      "A land of sweeping national parks, vibrant cities and iconic landmarks.",
    imageUrl: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74",
    continentName: "North America",
  },
  {
    name: "Australia",
    description: "A continent of red deserts, coral reefs and unique wildlife.",
    imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9",
    continentName: "Oceania",
  },
];

export const getCountriesSeedData = (
  continentMap: Map<string, mongoose.Types.ObjectId>,
) => {
  return rawCountriesData.map(({ continentName, ...country }) => ({
    ...country,
    continent: continentMap.get(continentName),
  }));
};
