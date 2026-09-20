import { apiClient } from "@/src/api";
import {
  findBeveragePreviewTemplate,
  type BeveragePreview,
} from "./sampleBeverages";

export type SaleBeverage = {
  beverageId: number;
  name: string;
  imgUrl: string;
  price: number | null;
  isLimited: boolean | null;
  saleEndsAt?: string | null;
};

export type OwnedBeverage = {
  beverageId: number;
  name: string;
  imgUrl: string;
  isSelected: boolean;
  acquiredAt: string;
};

export type SelectedBeverage = {
  beverageId: number;
  name: string;
  imgUrl: string;
};

export function getSaleBeverages() {
  return apiClient.request<SaleBeverage[]>("/beverages", { auth: false });
}

export function getOwnedBeverages() {
  return apiClient.request<OwnedBeverage[]>("/users/me/beverages");
}

export function getSelectedBeverage() {
  return apiClient.request<SelectedBeverage>(
    "/users/me/selected-beverage",
  );
}

export function selectBeverage(beverageId: number) {
  return apiClient.request<SelectedBeverage>(
    "/users/me/selected-beverage",
    {
      method: "PUT",
      body: { beverageId },
    },
  );
}

export function toOwnedBeveragePreview(
  beverage: OwnedBeverage,
): BeveragePreview {
  const template = findBeveragePreviewTemplate(beverage);

  return {
    ...template,
    id: String(beverage.beverageId),
    templateId: template.id,
    name: beverage.name,
    isOwned: true,
  };
}
