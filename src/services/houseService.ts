import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  House,
  CreateHouseRequest,
  JoinHouseRequest,
  UpdateHouseRequest,
} from "../types/houses";
import { STORAGE_KEYS, API_ENDPOINTS } from "../constants";

export const houseService = {
  async updateMemberRole(
    houseId: string,
    membershipId: string,
    role: "admin" | "member"
  ): Promise<void> {
    await api.patch(API_ENDPOINTS.PATCH_MEMBER_ROLE(houseId, membershipId), {
      role,
    });
  },

  async removeMember(houseId: string, membershipId: string): Promise<void> {
    await api.delete(`/houses/${houseId}/members/${membershipId}`);
  },
  async createHouse(houseData: CreateHouseRequest): Promise<House> {
    const response = await api.post<House>(
      API_ENDPOINTS.POST_CREATE_HOUSE,
      houseData
    );

    // Store the new house as current house
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_HOUSE,
      JSON.stringify(response.data)
    );

    return response.data;
  },

  async joinHouse(joinData: JoinHouseRequest): Promise<House> {
    const response = await api.post<House>(
      API_ENDPOINTS.POST_JOIN_HOUSE,
      joinData
    );

    // Store the joined house as current house
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_HOUSE,
      JSON.stringify(response.data)
    );

    return response.data;
  },

  async getUserHouses(): Promise<House[]> {
    const response = await api.get<House[]>(API_ENDPOINTS.GET_USER_HOUSES);

    // Store the houses list
    await AsyncStorage.setItem(
      STORAGE_KEYS.HOUSES,
      JSON.stringify(response.data)
    );

    return response.data;
  },

  async getHouseDetails(houseId: string): Promise<House> {
    const response = await api.get<House>(
      API_ENDPOINTS.GET_HOUSE_BY_ID(houseId)
    );
    return response.data;
  },

  async updateHouse(
    houseId: string,
    updateData: UpdateHouseRequest
  ): Promise<House> {
    const response = await api.patch<House>(
      API_ENDPOINTS.PATCH_HOUSE_BY_ID(houseId),
      updateData
    );

    // Update stored current house if it's the same house
    const currentHouse = await this.getStoredCurrentHouse();
    if (currentHouse && currentHouse.id === houseId) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_HOUSE,
        JSON.stringify(response.data)
      );
    }

    return response.data;
  },

  async uploadHouseImage(houseId: string, imageUri: string): Promise<House> {
    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "house.jpg",
    } as any);

    const response = await api.post<House>(
      API_ENDPOINTS.POST_UPLOAD_HOUSE_IMAGE(houseId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Update stored current house if it's the same house
    const currentHouse = await this.getStoredCurrentHouse();
    if (currentHouse && currentHouse.id === houseId) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_HOUSE,
        JSON.stringify(response.data)
      );
    }

    return response.data;
  },

  async setCurrentHouse(house: House): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.CURRENT_HOUSE,
      JSON.stringify(house)
    );
  },

  async getStoredCurrentHouse(): Promise<House | null> {
    const houseStr = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_HOUSE);
    return houseStr ? JSON.parse(houseStr) : null;
  },

  async getStoredHouses(): Promise<House[]> {
    const housesStr = await AsyncStorage.getItem(STORAGE_KEYS.HOUSES);
    return housesStr ? JSON.parse(housesStr) : [];
  },

  async clearHouseData(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_HOUSE);
    await AsyncStorage.removeItem(STORAGE_KEYS.HOUSES);
  },

  // Utility method to validate invite codes
  validateInviteCode(inviteCode: string): boolean {
    // Based on API docs, invite codes are typically 6-8 uppercase alphanumeric characters
    const inviteCodeRegex = /^[A-Z0-9]{6,8}$/;
    return inviteCodeRegex.test(inviteCode.toUpperCase());
  },

  // Utility method to validate display names
  validateDisplayName(
    displayName: string,
    minLength: number = 2,
    maxLength: number = 30
  ): boolean {
    const trimmed = displayName.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  },

  // Utility method to validate house names
  validateHouseName(
    houseName: string,
    minLength: number = 2,
    maxLength: number = 50
  ): boolean {
    const trimmed = houseName.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
  },

  async deleteHouse(houseId: string): Promise<void> {
    await api.delete(`/houses/${houseId}/leave`);
  },
};
