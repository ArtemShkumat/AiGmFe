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

// Define PromptType enum to match backend
export enum PromptType {
  DM = 0,
  NPC = 1
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
  promptType: PromptType;
  npcId?: string;
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
  from: "player" | "dm" | "npc";
  text: string;
  timestamp?: Date;
  npcId?: string;
  npcName?: string;
}

// New interfaces for the RPG game
export interface VisualDescription {
  gender: string;
  bodyType: string;
  visibleClothing: string;
  condition: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  visualDescription: VisualDescription;
  age: number;
  backstory: string;
  currentLocationId: string;
  relationships: any[];
  money: number;
  statusEffects: any[];
  rpgElements: Record<string, Record<string, number | string> | number | string>;
  activeQuests: any[];
  playerLog: any[];
  notes: string;
}

export interface InventoryItem {
  name: string;
  description: string;
  quantity: number;
}

export interface NPCRelationship {
  npcId: string;
  relationshipType: string;
}

export interface NPC {
  type: string;
  id: string;
  name: string;
  age: number;
  currentLocationId: string;
  discoveredByPlayer: boolean;
  visibleToPlayer: boolean;
  visualDescription: VisualDescription;
  personality?: {
    temperament: string;
    traits: string;
  };
  backstory: string;
  dispositionTowardsPlayer: string;
  knownEntities?: {
    npcsKnown: string[];
    locationsKnown: string[];
  };
  relationships: NPCRelationship[];
  questInvolvement?: string[];
  inventory?: {
    itemId: string;
    quantity: number;
  }[];
  statusFlags: {
    isAlive: boolean;
    isBusy: boolean;
    customState: string;
  };
  notes: string;
  conversationLog?: {
    Player?: string;
    [key: string]: string | undefined;
  }[];
} 