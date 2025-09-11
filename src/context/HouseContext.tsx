import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  House, 
  HouseState, 
  CreateHouseRequest, 
  JoinHouseRequest, 
  UpdateHouseRequest 
} from '../types/houses';
import { houseService } from '../services/houseService';
import { useAuth } from './AuthContext';

interface HouseContextType extends HouseState {
  createHouse: (houseData: CreateHouseRequest) => Promise<House>;
  joinHouse: (joinData: JoinHouseRequest) => Promise<House>;
  getUserHouses: () => Promise<House[]>;
  getHouseDetails: (houseId: string) => Promise<House>;
  updateHouse: (houseId: string, updateData: UpdateHouseRequest) => Promise<House>;
  uploadHouseImage: (houseId: string, imageUri: string) => Promise<House>;
  setCurrentHouse: (house: House) => void;
  switchToHouse: (houseId: string) => Promise<House | null>;
  clearHouseData: () => Promise<void>;
  refreshHouses: () => Promise<void>;
  checkHouseStatus: () => Promise<void>;
}

const HouseContext = createContext<HouseContextType | undefined>(undefined);

type HouseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HOUSES'; payload: House[] }
  | { type: 'SET_CURRENT_HOUSE'; payload: House | null }
  | { type: 'ADD_HOUSE'; payload: House }
  | { type: 'UPDATE_HOUSE'; payload: House }
  | { type: 'RESET_HOUSES' };

const houseReducer = (state: HouseState, action: HouseAction): HouseState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_HOUSES':
      return { 
        ...state, 
        houses: action.payload,
        // If no current house is set and we have houses, set the first one
        currentHouse: state.currentHouse || (action.payload.length > 0 ? action.payload[0] : null)
      };
    case 'SET_CURRENT_HOUSE':
      return { ...state, currentHouse: action.payload };
    case 'ADD_HOUSE':
      const updatedHouses = [...state.houses, action.payload];
      return {
        ...state,
        houses: updatedHouses,
        // Set as current house if it's the first house
        currentHouse: state.houses.length === 0 ? action.payload : state.currentHouse
      };
    case 'UPDATE_HOUSE':
      const updatedHousesList = state.houses.map(house =>
        house.id === action.payload.id ? action.payload : house
      );
      return {
        ...state,
        houses: updatedHousesList,
        // Update current house if it's the same house
        currentHouse: state.currentHouse?.id === action.payload.id 
          ? action.payload 
          : state.currentHouse
      };
    case 'RESET_HOUSES':
      return {
        houses: [],
        currentHouse: null,
        isLoading: false,
      };
    default:
      return state;
  }
};

const initialState: HouseState = {
  houses: [],
  currentHouse: null,
  isLoading: true,
};

export function HouseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(houseReducer, initialState);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const checkHouseStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load stored data first for immediate UI feedback, but only if it has membership data
      const storedHouses = await houseService.getStoredHouses();
      const storedCurrentHouse = await houseService.getStoredCurrentHouse();
      
      // Only use stored houses if they have membership data, otherwise they're incomplete
      const hasCompleteMembershipData = storedHouses.length > 0 && 
        storedHouses.every(house => house.membership && house.membership.role);
      
      if (hasCompleteMembershipData) {
        dispatch({ type: 'SET_HOUSES', payload: storedHouses });
      }
      if (storedCurrentHouse && storedCurrentHouse.membership) {
        dispatch({ type: 'SET_CURRENT_HOUSE', payload: storedCurrentHouse });
      }
      
      // Always refresh from server to ensure we have the latest complete data
      await refreshHouses();
    } catch (error) {
      console.error('Error checking house status:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshHouses = async () => {
    try {
      const houses = await houseService.getUserHouses();
      dispatch({ type: 'SET_HOUSES', payload: houses });
      
      // If current house is not in the list, clear it
      const currentHouse = state.currentHouse;
      if (currentHouse && !houses.find(h => h.id === currentHouse.id)) {
        dispatch({ type: 'SET_CURRENT_HOUSE', payload: null });
      }
    } catch (error: any) {
      console.error('Error refreshing houses:', error);
      
      // If it's a 401/403 or user has no houses, set empty array instead of throwing
      if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
        dispatch({ type: 'SET_HOUSES', payload: [] });
        dispatch({ type: 'SET_CURRENT_HOUSE', payload: null });
      } else {
        throw error;
      }
    }
  };

  const getUserHouses = async (): Promise<House[]> => {
    try {
      const houses = await houseService.getUserHouses();
      dispatch({ type: 'SET_HOUSES', payload: houses });
      return houses;
    } catch (error: any) {
      console.error('Error getting user houses:', error);
      
      // If it's a 401/403 or user has no houses, return empty array instead of throwing
      if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
        const emptyHouses: House[] = [];
        dispatch({ type: 'SET_HOUSES', payload: emptyHouses });
        dispatch({ type: 'SET_CURRENT_HOUSE', payload: null });
        return emptyHouses;
      } else {
        throw error;
      }
    }
  };

  const createHouse = async (houseData: CreateHouseRequest): Promise<House> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newHouse = await houseService.createHouse(houseData);
      
      dispatch({ type: 'ADD_HOUSE', payload: newHouse });
      dispatch({ type: 'SET_CURRENT_HOUSE', payload: newHouse });
      
      return newHouse;
    } catch (error) {
      console.error('Error creating house:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const joinHouse = async (joinData: JoinHouseRequest): Promise<House> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const joinedHouse = await houseService.joinHouse(joinData);
      
      dispatch({ type: 'ADD_HOUSE', payload: joinedHouse });
      dispatch({ type: 'SET_CURRENT_HOUSE', payload: joinedHouse });
      
      return joinedHouse;
    } catch (error) {
      console.error('Error joining house:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getHouseDetails = async (houseId: string): Promise<House> => {
    try {
      const house = await houseService.getHouseDetails(houseId);
      
      // Update the house in our list if it exists
      dispatch({ type: 'UPDATE_HOUSE', payload: house });
      
      return house;
    } catch (error) {
      console.error('Error getting house details:', error);
      throw error;
    }
  };

  const updateHouse = async (houseId: string, updateData: UpdateHouseRequest): Promise<House> => {
    try {
      const updatedHouse = await houseService.updateHouse(houseId, updateData);
      
      dispatch({ type: 'UPDATE_HOUSE', payload: updatedHouse });
      
      return updatedHouse;
    } catch (error) {
      console.error('Error updating house:', error);
      throw error;
    }
  };

  const uploadHouseImage = async (houseId: string, imageUri: string): Promise<House> => {
    try {
      const updatedHouse = await houseService.uploadHouseImage(houseId, imageUri);
      
      dispatch({ type: 'UPDATE_HOUSE', payload: updatedHouse });
      
      return updatedHouse;
    } catch (error) {
      console.error('Error uploading house image:', error);
      throw error;
    }
  };

  const setCurrentHouse = (house: House) => {
    dispatch({ type: 'SET_CURRENT_HOUSE', payload: house });
    houseService.setCurrentHouse(house);
  };

  const switchToHouse = async (houseId: string): Promise<House | null> => {
    try {
      // Find the house in the current houses list
      const targetHouse = state.houses.find(house => house.id === houseId);
      
      if (!targetHouse) {
        // If house not found in local list, try to get fresh details
        const houseDetails = await getHouseDetails(houseId);
        if (houseDetails) {
          setCurrentHouse(houseDetails);
          return houseDetails;
        }
        return null;
      }
      
      // Get fresh details for the house to ensure we have complete data
      const houseDetails = await getHouseDetails(houseId);
      setCurrentHouse(houseDetails);
      return houseDetails;
    } catch (error) {
      console.error('Error switching to house:', error);
      // Fallback to basic house data if available
      const targetHouse = state.houses.find(house => house.id === houseId);
      if (targetHouse) {
        setCurrentHouse(targetHouse);
        return targetHouse;
      }
      return null;
    }
  };

  const clearHouseData = async () => {
    try {
      await houseService.clearHouseData();
      dispatch({ type: 'RESET_HOUSES' });
    } catch (error) {
      console.error('Error clearing house data:', error);
      // Still reset the state even if clearing storage fails
      dispatch({ type: 'RESET_HOUSES' });
    }
  };

  useEffect(() => {
    // Only check house status when authentication is complete and user is authenticated
    if (!authLoading && isAuthenticated) {
      checkHouseStatus();
    } else if (!authLoading && !isAuthenticated) {
      // User is not authenticated, reset house state
      dispatch({ type: 'RESET_HOUSES' });
    }
  }, [isAuthenticated, authLoading]);

  const value: HouseContextType = {
    ...state,
    createHouse,
    joinHouse,
    getUserHouses,
    getHouseDetails,
    updateHouse,
    uploadHouseImage,
    setCurrentHouse,
    switchToHouse,
    clearHouseData,
    refreshHouses,
    checkHouseStatus,
  };

  return (
    <HouseContext.Provider value={value}>
      {children}
    </HouseContext.Provider>
  );
}

export function useHouse() {
  const context = useContext(HouseContext);
  if (context === undefined) {
    throw new Error('useHouse must be used within a HouseProvider');
  }
  return context;
}