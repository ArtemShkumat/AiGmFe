import axios, { AxiosError } from 'axios';
import { 
  Scenario, 
  Game, 
  CreateGameRequest, 
  CreateGameResponse,
  CreateCharacterRequest,
  UserInputRequest,
  PlayerInfo,
  NPC,
  InventoryItem,
  PromptType
} from '../types';

const BASE_URL = 'http://localhost:5000/api'; // Base API URL
const ENTITY_STATUS_CONTROLLER = `${BASE_URL}/EntityStatus`; // Entity Status controller
const GAME_MANAGEMENT_CONTROLLER = `${BASE_URL}/GameManagement`; // Game Management controller
const GAME_STATE_CONTROLLER = `${BASE_URL}/GameState`; // Game State controller
const INTERACTION_CONTROLLER = `${BASE_URL}/Interaction`; // Interaction controller
const GAME_ADMIN_CONTROLLER = `${BASE_URL}/GameAdmin`; // Game Admin controller

// Error handling helper
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(
        `API Error: ${axiosError.response.status} - ${
          typeof axiosError.response.data === 'string'
            ? axiosError.response.data
            : JSON.stringify(axiosError.response.data)
        }`
      );
    } else if (axiosError.request) {
      // The request was made but no response was received
      throw new Error('Network error: Server not responding. Please check if the backend service is running.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Request setup error: ${axiosError.message}`);
    }
  } else {
    // Non-Axios error
    throw error;
  }
};

// API functions for the RPG game
const api = {
  // Get list of scenarios
  getScenarios: async (): Promise<Scenario[]> => {
    try {
      const response = await axios.get<Scenario[]>(`${GAME_MANAGEMENT_CONTROLLER}/scenarios`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return []; // This line will never be reached due to the throw in handleApiError
    }
  },

  // Get list of existing games
  listGames: async (): Promise<Game[]> => {
    try {
      const response = await axios.get<Game[]>(`${GAME_MANAGEMENT_CONTROLLER}/listGames`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return []; 
    }
  },

  // Create a new game
  createGame: async (request: CreateGameRequest): Promise<string> => {
    try {
      const response = await axios.post<CreateGameResponse>(`${GAME_MANAGEMENT_CONTROLLER}/createGame`, request);
      return response.data.gameId;
    } catch (error) {
      handleApiError(error);
      return '';
    }
  },

  // Create character
  createCharacter: async (request: CreateCharacterRequest): Promise<boolean> => {
    try {
      await axios.post(`${INTERACTION_CONTROLLER}/createCharacter`, request);
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  // Send user input and get response
  sendUserInput: async (request: UserInputRequest): Promise<string> => {
    try {
      // Ensure NpcId is provided when PromptType is NPC
      if (request.promptType === PromptType.NPC && !request.npcId) {
        throw new Error('NpcId is required for NPC chat type');
      }
      
      // Construct the request with proper property casing
      const formattedRequest = {
        GameId: request.gameId,
        UserInput: request.userInput,
        PromptType: request.promptType,
        NpcId: request.npcId || null // Include null explicitly for DM chats
      };
      const response = await axios.post<any>(`${INTERACTION_CONTROLLER}/input`, formattedRequest);
      
      // Check if response.data is an object with response property
      if (response.data && typeof response.data === 'object' && response.data.response) {
        return response.data.response;
      }
      
      // Otherwise, try to convert to string if possible
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } catch (error) {
      handleApiError(error);
      return '';
    }
  },
  
  // Get player information
  getPlayerInfo: async (gameId: string): Promise<PlayerInfo | null> => {
    try {
      const response = await axios.get<PlayerInfo>(`${GAME_STATE_CONTROLLER}/player?gameId=${gameId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return null;
    }
  },
  
  // Get visible NPCs
  getVisibleNpcs: async (gameId: string): Promise<NPC[]> => {
    try {
      const response = await axios.get<NPC[]>(`${GAME_STATE_CONTROLLER}/visibleNpcs?gameId=${gameId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },
  
  // Get player inventory
  getPlayerInventory: async (gameId: string): Promise<InventoryItem[]> => {
    try {
      const response = await axios.get<InventoryItem[]>(`${GAME_STATE_CONTROLLER}/inventory?gameId=${gameId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return [];
    }
  },

  // Check for pending entities - uses EntityStatus controller
  hasPendingEntities: async (gameId: string): Promise<boolean> => {
    try {
      const response = await axios.get<boolean>(`${ENTITY_STATUS_CONTROLLER}/pending/${gameId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },
  
  // Validate game data - Admin function
  validateGameData: async (gameId: string): Promise<string> => {
    try {
      const response = await axios.get<any>(`${GAME_ADMIN_CONTROLLER}/${gameId}/validate`);
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
    } catch (error) {
      handleApiError(error);
      return '';
    }
  },
  
  // Auto-create dangling references - Admin function
  autocreateGamlingReferences: async (gameId: string): Promise<string> => {
    try {
      const response = await axios.post<any>(`${GAME_ADMIN_CONTROLLER}/${gameId}/autocreate-dangling`);
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
    } catch (error) {
      handleApiError(error);
      return '';
    }
  },
  
  // Sync NPC locations - Admin function
  syncNpcLocations: async (gameId: string): Promise<string> => {
    try {
      const response = await axios.post<any>(`${GAME_ADMIN_CONTROLLER}/${gameId}/sync-npc-locations`);
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
    } catch (error) {
      handleApiError(error);
      return '';
    }
  }
};

export default api; 