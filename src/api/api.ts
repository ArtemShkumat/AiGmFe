import axios, { AxiosError } from 'axios';
import { 
  Scenario, 
  Game, 
  CreateGameRequest, 
  CreateGameResponse,
  CreateCharacterRequest,
  UserInputRequest
} from '../types';

const API_URL = 'http://localhost:5000/api/RPG'; // Adjust this to match your backend URL

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
      const response = await axios.get<Scenario[]>(`${API_URL}/scenarios`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return []; // This line will never be reached due to the throw in handleApiError
    }
  },

  // Get list of existing games
  listGames: async (): Promise<Game[]> => {
    try {
      const response = await axios.get<Game[]>(`${API_URL}/listGames`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return []; 
    }
  },

  // Create a new game
  createGame: async (request: CreateGameRequest): Promise<string> => {
    try {
      const response = await axios.post<CreateGameResponse>(`${API_URL}/createGame`, request);
      return response.data.gameId;
    } catch (error) {
      handleApiError(error);
      return '';
    }
  },

  // Create character
  createCharacter: async (request: CreateCharacterRequest): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}/createCharacter`, request);
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    }
  },

  // Send user input and get response
  sendUserInput: async (request: UserInputRequest): Promise<string> => {
    try {
      // Construct the request with proper property casing
      const formattedRequest = {
        GameId: request.gameId,
        UserInput: request.userInput,
        PromptType: request.promptType
      };
      const response = await axios.post<string>(`${API_URL}/input`, formattedRequest);
      return response.data;
    } catch (error) {
      handleApiError(error);
      return '';
    }
  }
};

export default api; 