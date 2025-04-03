import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import api from '../api/api';
import { Message, PromptType, NPC, PlayerInfo, InventoryItem } from '../types';

// Import smaller components
import GameHeader from '../components/game/GameHeader';
import NPCList from '../components/game/NPCList';
import NPCChat from '../components/game/NPCChat';
import CharacterSheet from '../components/game/CharacterSheet';
import InventoryDisplay from '../components/game/InventoryDisplay';
import SidebarControls from '../components/game/SidebarControls';
import DMChat from '../components/game/DMChat';
import AdminDialog from '../components/game/AdminDialog';

type MainWindowView = 'npc-chat' | 'inventory' | 'character';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  // Game State
  const [messages, setMessages] = useState<Message[]>([]);
  const [dmMessages, setDmMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [npcInput, setNpcInput] = useState('');
  const [dmInput, setDmInput] = useState('');
  const [isNpcLoading, setIsNpcLoading] = useState(false);
  const [isDmLoading, setIsDmLoading] = useState(false);
  const [isNpcsLoading, setIsNpcsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [hasPendingEntities, setHasPendingEntities] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // UI State
  const [mainWindowView, setMainWindowView] = useState<MainWindowView>('npc-chat');
  const [npcsExpanded, setNpcsExpanded] = useState(true);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [visibleNpcs, setVisibleNpcs] = useState<NPC[]>([]);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [npcChats, setNpcChats] = useState<Map<string, Message[]>>(new Map());
  
  // Admin state
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminActionResult, setAdminActionResult] = useState<string | null>(null);
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  
  // Initialize game state
  useEffect(() => {
    if (gameId) {
      // Fetch initial game data
      fetchGameData();
    } else {
      setError('Game ID is missing. Please return to the title screen.');
      setOpenSnackbar(true);
    }
  }, [gameId]);
  
  // Fetch visible NPCs only
  const fetchVisibleNpcs = async () => {
    if (!gameId) return;
    
    try {
      setIsNpcsLoading(true);
      const npcsData = await api.getVisibleNpcs(gameId);
      setVisibleNpcs(npcsData);
      
      // If currently no NPC is selected but NPCs are available, select the first one
      if (npcsData.length > 0 && !selectedNpc) {
        setSelectedNpc(npcsData[0]);
        setMainWindowView('npc-chat');
      } else if (selectedNpc) {
        // Make sure selected NPC is still in the visible list, otherwise select the first one
        const stillExists = npcsData.some(npc => npc.id === selectedNpc.id);
        if (!stillExists && npcsData.length > 0) {
          setSelectedNpc(npcsData[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch visible NPCs:', err);
      setError('Failed to refresh visible NPCs. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setIsNpcsLoading(false);
    }
  };
  
  // Fetch game data from API
  const fetchGameData = async () => {
    if (!gameId) return;
    
    try {
      setIsNpcLoading(true);
      
      // Fetch player info, NPCs, and inventory in parallel
      const [playerData, npcsData, inventoryData] = await Promise.all([
        api.getPlayerInfo(gameId),
        api.getVisibleNpcs(gameId),
        api.getPlayerInventory(gameId)
      ]);
      
      if (playerData) setPlayerInfo(playerData);
      setVisibleNpcs(npcsData);
      setInventory(inventoryData);
      
      // Initialize NPC chats based on conversation logs
      const newNpcChats = new Map<string, Message[]>();
      
      npcsData.forEach(npc => {
        const initialMessages: Message[] = [];
        
        // Add conversation log if any exists
        if (npc.conversationLog && npc.conversationLog.length > 0) {
          npc.conversationLog.forEach(entry => {
            const playerText = entry.Player;
            const npcResponse = entry[npc.name];
            
            if (playerText) {
              initialMessages.push({
                from: 'player',
                text: playerText,
                timestamp: new Date()
              });
            }
            
            if (npcResponse) {
              initialMessages.push({
                from: 'npc',
                text: npcResponse,
                npcId: npc.id,
                npcName: npc.name,
                timestamp: new Date()
              });
            }
          });
        }
        
        newNpcChats.set(npc.id, initialMessages);
      });
      
      setNpcChats(newNpcChats);
      
      // Select first NPC if available and none selected
      if (npcsData.length > 0 && !selectedNpc) {
        setSelectedNpc(npcsData[0]);
        setMainWindowView('npc-chat');
      }
      
    } catch (err) {
      console.error('Failed to fetch game data:', err);
      setError('Failed to load game data. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setIsNpcLoading(false);
    }
  };
  
  // Handle user input
  const handleUserInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };
  
  const handleNpcInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNpcInput(event.target.value);
  };
  
  const handleDmInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDmInput(event.target.value);
  };
  
  // Poll for pending entities
  const startPollingForPendingEntities = useCallback(() => {
    if (!gameId) return;
    
    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Set initial state
    setHasPendingEntities(true);
    
    // Start polling
    const interval = setInterval(async () => {
      try {
        const hasPending = await api.hasPendingEntities(gameId);
        setHasPendingEntities(hasPending);
        if (!hasPending) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      } catch (err) {
        console.error('Failed to check pending entities:', err);
        clearInterval(interval);
        setPollingInterval(null);
        setHasPendingEntities(false);
      }
    }, 1000); // Poll every second
    
    setPollingInterval(interval);
  }, [gameId, pollingInterval]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);
  
  // Modify handleSendMessage to start polling after sending input
  const handleSendMessage = useCallback(async (isNpcChat: boolean = false) => {
    if (!gameId) {
      setError('Game ID is missing. Please return to the title screen.');
      setOpenSnackbar(true);
      return;
    }
    
    if (isNpcChat && !selectedNpc) {
      setError('No NPC selected for chat.');
      setOpenSnackbar(true);
      return;
    }
    
    // Get the correct input based on chat type
    const input = isNpcChat ? npcInput : dmInput;
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    
    // Add user message to chat
    const userMessage: Message = {
      from: 'player',
      text: trimmedInput,
      timestamp: new Date()
    };
    
    // Clear input
    if (isNpcChat) {
      setNpcInput('');
    } else {
      setDmInput('');
    }
    
    // Set the appropriate loading state
    if (isNpcChat) {
      setIsNpcLoading(true);
    } else {
      setIsDmLoading(true);
    }
    
    try {
      if (isNpcChat && selectedNpc) {
        // NPC chat
        const updatedNpcChats = new Map(npcChats);
        const currentChat = updatedNpcChats.get(selectedNpc.id) || [];
        updatedNpcChats.set(selectedNpc.id, [...currentChat, userMessage]);
        setNpcChats(updatedNpcChats);
        
        // Call API with user input to NPC
        const response = await api.sendUserInput({
          gameId,
          userInput: trimmedInput,
          promptType: PromptType.NPC,
          npcId: selectedNpc.id
        });
        
        // Add NPC response to chat
        const npcResponse: Message = {
          from: 'npc',
          text: typeof response === 'string' ? response : JSON.stringify(response),
          npcId: selectedNpc.id,
          npcName: selectedNpc.name,
          timestamp: new Date()
        };
        
        const updatedChatWithResponse = new Map(updatedNpcChats);
        const currentChatWithResponse = updatedChatWithResponse.get(selectedNpc.id) || [];
        updatedChatWithResponse.set(selectedNpc.id, [...currentChatWithResponse, npcResponse]);
        setNpcChats(updatedChatWithResponse);
        
        // Fetch updated visible NPCs after NPC responds
        await fetchVisibleNpcs();
      } else {
        // DM chat
        setDmMessages((prevMessages) => [...prevMessages, userMessage]);
        
        // Call API with user input to DM
        const response = await api.sendUserInput({
          gameId,
          userInput: trimmedInput,
          promptType: PromptType.DM
        });
        
        // Add DM response to chat
        const dmResponse: Message = {
          from: 'dm',
          text: typeof response === 'string' ? response : JSON.stringify(response),
          timestamp: new Date()
        };
        
        setDmMessages((prevMessages) => [...prevMessages, dmResponse]);
        
        // Fetch updated visible NPCs after DM responds
        await fetchVisibleNpcs();
      }
      
      // Start polling for pending entities after sending input
      startPollingForPendingEntities();
      
      setError(null);
    } catch (err) {
      console.error('Failed to send user input:', err);
      setError('Failed to get response from the game. Please try again.');
      setOpenSnackbar(true);
    } finally {
      // Clear the appropriate loading state
      if (isNpcChat) {
        setIsNpcLoading(false);
      } else {
        setIsDmLoading(false);
      }
    }
  }, [gameId, npcInput, dmInput, selectedNpc, npcChats, startPollingForPendingEntities]);
  
  // Handle enter key press
  const handleKeyPress = useCallback((event: React.KeyboardEvent, isNpcChat: boolean = false) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(isNpcChat);
    }
  }, [handleSendMessage]);
  
  // UI Handlers
  const handleReturnToTitle = () => {
    navigate('/');
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  const toggleNpcsExpanded = () => {
    setNpcsExpanded(!npcsExpanded);
  };
  
  const handleSelectNpc = (npc: NPC) => {
    setSelectedNpc(npc);
    setMainWindowView('npc-chat');
  };
  
  const handleShowInventory = () => {
    setMainWindowView('inventory');
  };
  
  const handleShowCharacter = () => {
    setMainWindowView('character');
  };
  
  // Admin functions
  const handleOpenAdminDialog = () => {
    setAdminDialogOpen(true);
    setAdminActionResult(null);
  };

  const handleCloseAdminDialog = () => {
    setAdminDialogOpen(false);
  };

  const handleValidateGameData = async () => {
    if (!gameId) return;
    
    try {
      setAdminActionLoading(true);
      const result = await api.validateGameData(gameId);
      setAdminActionResult(result);
    } catch (err) {
      console.error('Failed to validate game data:', err);
      setAdminActionResult('Error validating game data. Check console for details.');
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleAutocreateReferences = async () => {
    if (!gameId) return;
    
    try {
      setAdminActionLoading(true);
      const result = await api.autocreateGamlingReferences(gameId);
      setAdminActionResult(result);
    } catch (err) {
      console.error('Failed to autocreate references:', err);
      setAdminActionResult('Error creating dangling references. Check console for details.');
    } finally {
      setAdminActionLoading(false);
    }
  };
  
  const handleSyncNpcLocations = async () => {
    if (!gameId) return;
    
    try {
      setAdminActionLoading(true);
      const result = await api.syncNpcLocations(gameId);
      setAdminActionResult(result);
    } catch (err) {
      console.error('Failed to sync NPC locations:', err);
      setAdminActionResult('Error syncing NPC locations. Check console for details.');
    } finally {
      setAdminActionLoading(false);
    }
  };
  
  // Render the main window content
  const renderMainWindowContent = () => {
    if (mainWindowView === 'npc-chat' && selectedNpc) {
      const currentChat = npcChats.get(selectedNpc.id) || [];
      
      return (
        <NPCChat 
          selectedNpc={selectedNpc}
          messages={currentChat}
          npcInput={npcInput}
          isNpcLoading={isNpcLoading}
          onNpcInputChange={handleNpcInputChange}
          onKeyPress={(e) => handleKeyPress(e, true)}
          onSendMessage={() => handleSendMessage(true)}
        />
      );
    } else if (mainWindowView === 'inventory') {
      return <InventoryDisplay inventory={inventory} />;
    } else if (mainWindowView === 'character') {
      return <CharacterSheet playerInfo={playerInfo} onOpenAdminDialog={handleOpenAdminDialog} />;
    }
    
    return null;
  };
  
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
    >
      {/* Game Header */}
      <GameHeader 
        playerInfo={playerInfo} 
        gameId={gameId} 
        hasPendingEntities={hasPendingEntities} 
        onReturnToTitle={handleReturnToTitle} 
      />
      
      {/* Main Content Area - Grid layout */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {/* Main Window - Left/Center Area */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            borderRight: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          {renderMainWindowContent()}
        </Box>
        
        {/* Right Sidebar */}
        <Box
          sx={{
            width: 300,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          {/* NPC List */}
          <NPCList 
            visibleNpcs={visibleNpcs}
            selectedNpc={selectedNpc}
            mainWindowView={mainWindowView}
            npcsExpanded={npcsExpanded}
            isNpcsLoading={isNpcsLoading}
            onToggleNpcsExpanded={toggleNpcsExpanded}
            onSelectNpc={handleSelectNpc}
            onRefreshNpcs={fetchVisibleNpcs}
          />
          
          {/* Inventory and Character Buttons */}
          <SidebarControls 
            mainWindowView={mainWindowView}
            inventoryCount={inventory.length}
            onShowInventory={handleShowInventory}
            onShowCharacter={handleShowCharacter}
          />
        </Box>
      </Box>
      
      {/* Bottom Bar - DM Chat Area */}
      <Box
        sx={{
          height: '33%',
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <DMChat 
          messages={dmMessages}
          dmInput={dmInput}
          isDmLoading={isDmLoading}
          onDmInputChange={handleDmInputChange}
          onKeyPress={(e) => handleKeyPress(e, false)}
          onSendMessage={() => handleSendMessage(false)}
        />
      </Box>
      
      {/* Admin Dialog */}
      <AdminDialog 
        open={adminDialogOpen}
        isLoading={adminActionLoading}
        result={adminActionResult}
        onClose={handleCloseAdminDialog}
        onValidateGameData={handleValidateGameData}
        onAutocreateReferences={handleAutocreateReferences}
        onSyncNpcLocations={handleSyncNpcLocations}
      />
      
      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GamePage; 