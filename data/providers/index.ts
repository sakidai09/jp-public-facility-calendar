import { HakodateProvider } from "./hakodate";
import { YokohamaProvider } from "./yokohama";
import { FacilityProvider } from "../../lib/types";

export const providers: Record<string, FacilityProvider> = {
  hakodate: HakodateProvider,
  yokohama: YokohamaProvider,
};

export function getProvider(providerId: string): FacilityProvider | undefined {
  return providers[providerId];
}
