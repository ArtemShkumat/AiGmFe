// Game and scenario interfaces
export interface Scenario {
  scenarioId: string;
  name: string;
}

export interface Game {
  gameId: string;
  name: string;
}

// Request interfaces
export interface CreateGameRequest {
  scenarioId: string;
  gamePreferences: GamePreferences;
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
  tone: "light" | "neutral" | "dark";
  complexity: "low" | "medium" | "high";
  ageAppropriateness: "child" | "teen" | "mature";
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