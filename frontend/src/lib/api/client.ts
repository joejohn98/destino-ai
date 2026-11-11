import {
  API_BASE,
  destinationHref,
  shouldBypassImageOptimization,
  ApiError,
  fetchApi,
} from "./core";
import { authEndpoints } from "./endpoints/auth";
import { destinationEndpoints } from "./endpoints/destinations";
import { adminEndpoints } from "./endpoints/admin";
import { reviewEndpoints } from "./endpoints/reviews";
import { aiEndpoints } from "./endpoints/ai";

export {
  API_BASE,
  destinationHref,
  shouldBypassImageOptimization,
  ApiError,
  fetchApi,
};

export const api = {
  ...authEndpoints,
  ...destinationEndpoints,
  ...adminEndpoints,
  ...reviewEndpoints,
  ...aiEndpoints,
};
