import { atomWithStorage } from "jotai/utils";

export const weatherStates = ["sunny", "overcast", "rain", "storm"] as const;
export type WeatherState = (typeof weatherStates)[number];

export const weatherAtom = atomWithStorage<WeatherState>(
  "tron-weather",
  "sunny",
);
