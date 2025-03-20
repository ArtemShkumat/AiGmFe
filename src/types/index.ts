// Game and scenario interfaces
export interface Scenario {
  scenarioId: string;
  name: string;
  gameSetting?: GameSetting;
  gamePreferences?: GamePreferences;
}

export interface GameSetting {
  genre: string;
  theme: string;
  description: string;
}

export interface Game {
  gameId: string;
  name: string;
}

// Request interfaces
export interface CreateGameRequest {
  scenarioId: string;
  Preferences: GamePreferences;
}

export interface CreateCharacterRequest {
  gameId: string;
  characterDescription: string;
}

export interface UserInputRequest {
  gameId: string;
  userInput: string;
  promptType: "DM"; // Could be expanded in the future
}

// Game preference options
export interface GamePreferences {
  tone: string;
  complexity: string;
  ageAppropriateness: string;
}

// Response interfaces from backend
export interface CreateGameResponse {
  gameId: string;
}

// Message interface for chat
export interface Message {
  from: "player" | "dm";
  text: string;
  timestamp?: Date;
} 