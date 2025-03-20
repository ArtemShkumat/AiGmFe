# RPG Game UI

A React TypeScript application for playing a text-based RPG game powered by LLMs.

## Overview

This frontend application enables users to:
- Start new games with customizable settings
- Load existing game sessions
- Play the game through a chat-like interface
- Create characters using natural language descriptions

## Getting Started

### Prerequisites

- Node.js and npm installed
- Backend service running locally (refer to backend documentation)

### Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Start the development server:
```
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Architecture

This application follows a structured architecture with the following components:

### Pages

- **TitlePage**: Main entry point with options to start a new game or load an existing one
- **NewGameFlowPage**: Multi-step form for setting up a new game and creating a character
- **GamePage**: Main game interface with chat functionality

### API Interactions

The frontend communicates with a local backend service through various endpoints:
- `GET /api/RPG/scenarios`: Retrieve available game scenarios
- `GET /api/RPG/listGames`: Get a list of existing game sessions
- `POST /api/RPG/createGame`: Create a new game with selected preferences
- `POST /api/RPG/createCharacter`: Generate a character from text description
- `POST /api/RPG/input`: Send player inputs and get game responses

## Technologies Used

- React
- TypeScript
- Material UI
- React Router
- Axios
