import { User, HouseMembership } from './auth';

export interface House {
  id: string;
  name: string;
  address?: string;
  description?: string;
  inviteCode: string;
  imageUrl?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberships?: HouseMembership[];
  userMembership?: HouseMembership;
  members?: HouseMembership[];
  membership?: HouseMembership; // Current user's membership in this house
}

export interface CreateHouseRequest {
  name: string;
  address?: string;
  description?: string;
  displayName: string;
}

export interface JoinHouseRequest {
  inviteCode: string;
  displayName: string;
}

export interface UpdateHouseRequest {
  name?: string;
  address?: string;
  description?: string;
  imageUrl?: string;
  color?: string;
}

export interface HouseState {
  houses: House[];
  currentHouse: House | null;
  isLoading: boolean;
}