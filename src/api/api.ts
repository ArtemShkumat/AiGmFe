import axios from 'axios';
import { 
  Scenario, 
  Game, 
  CreateGameRequest, 
  CreateGameResponse,
  CreateCharacterRequest,
  UserInputRequest
} from '../types';

const API_URL = 'http://localhost:5000/api/RPG'; // Adjust this to match your backend URL

// API functions for the RPG game
const api = {
  // Get list of scenarios
  getScenarios: async (): Promise<Scenario[]> => {
    const response = await axios.get<Scenario[]>(`${API_URL}/scenarios`);
    return response.data;
  },

  // Get list of existing games
  listGames: async (): Promise<Game[]> => {
    const response = await axios.get<Game[]>(`${API_URL}/listGames`);
    return response.data;
  },

  // Create a new game
  createGame: async (request: CreateGameRequest): Promise<string> => {
    const response = await axios.post<CreateGameResponse>(`${API_URL}/createGame`, request);
    return response.data.gameId;
  },

  // Create character
  createCharacter: async (request: CreateCharacterRequest): Promise<boolean> => {
    await axios.post(`${API_URL}/createCharacter`, request);
    return true;
  },

  // Send user input and get response
  sendUserInput: async (request: UserInputRequest): Promise<string> => {
    const response = await axios.post<string>(`${API_URL}/input`, request);
    return response.data;
  }
};

export default api; 