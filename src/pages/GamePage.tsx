import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemButton,
  Divider,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  useTheme,
  Card,
  CardContent,
  Collapse,
  Grid,
  Avatar,
  Badge,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import api from '../api/api';
import { Message, PromptType, NPC, PlayerInfo, InventoryItem } from '../types';

type MainWindowView = 'npc-chat' | 'inventory' | 'character';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dmMessagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    if (mainWindowView === 'npc-chat' && selectedNpc) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [npcChats, selectedNpc, mainWindowView]);
  
  useEffect(() => {
    dmMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages]);
  
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
  
  // Render message bubbles
  const renderMessage = (message: Message, index: number, isLast: boolean) => (
    <React.Fragment key={index}>
      <ListItem
        alignItems="flex-start"
        sx={{
          flexDirection: 'column',
          alignItems: message.from === 'player' ? 'flex-end' : 'flex-start',
          mb: 2
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{
            color: 'text.secondary',
            mb: 0.5,
            fontWeight: 500
          }}
        >
          {message.from === 'player' 
            ? 'You' 
            : message.from === 'dm' 
              ? 'Dungeon Master' 
              : message.npcName || 'NPC'}
        </Typography>
        
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            maxWidth: '80%',
            bgcolor: message.from === 'player' 
              ? 'primary.dark' 
              : message.from === 'npc' 
                ? theme.palette.secondary.dark 
                : 'background.paper',
            border: `1px solid ${
              message.from === 'player' 
                ? theme.palette.primary.main 
                : message.from === 'npc' 
                  ? theme.palette.secondary.main 
                  : '#333'
            }`
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {message.text}
          </Typography>
        </Paper>
      </ListItem>
      {!isLast && (
        <Divider variant="middle" sx={{ my: 1, opacity: 0.2 }} />
      )}
    </React.Fragment>
  );
  
  // Render the main window content based on the current view
  const renderMainWindowContent = () => {
    if (mainWindowView === 'npc-chat' && selectedNpc) {
      const currentChat = npcChats.get(selectedNpc.id) || [];
      
      return (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
              {selectedNpc.name.charAt(0)}
            </Avatar>
            <Typography variant="h6">{selectedNpc.name}</Typography>
          </Box>
          
          <Box sx={{ 
            flexGrow: 1, 
            p: 2, 
            overflow: 'auto',
            bgcolor: theme.palette.background.default
          }}>
            <List sx={{ width: '100%' }}>
              {currentChat.map((message, index) => (
                renderMessage(message, index, index === currentChat.length - 1)
              ))}
              <div ref={messagesEndRef} />
            </List>
            
            {isNpcLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
          
          <Box
            component="form"
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(true);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Say something to this character..."
                value={npcInput}
                onChange={handleNpcInputChange}
                onKeyPress={(e) => handleKeyPress(e, true)}
                disabled={isNpcLoading}
                multiline
                maxRows={3}
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <Button
                variant="contained"
                color="secondary"
                endIcon={<SendIcon />}
                onClick={() => handleSendMessage(true)}
                disabled={isNpcLoading || !npcInput.trim()}
                sx={{ ml: 1, height: 55, borderRadius: 2, px: 3 }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </>
      );
    } else if (mainWindowView === 'inventory') {
      return (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <InventoryIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Inventory</Typography>
          </Box>
          
          <Box sx={{ p: 3, overflow: 'auto' }}>
            {inventory.length === 0 ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                Your inventory is empty.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {inventory.map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {item.name} {item.quantity > 1 && `(${item.quantity})`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      );
    } else if (mainWindowView === 'character') {
      return (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 2 }} />
              <Typography variant="h6">Character Sheet</Typography>
            </Box>
            <IconButton 
              color="primary" 
              onClick={handleOpenAdminDialog} 
              title="Admin Tools"
            >
              <AdminPanelSettingsIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ p: 3, overflow: 'auto' }}>
            {!playerInfo ? (
              <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                Character information not available.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" gutterBottom>{playerInfo.name}</Typography>
                    <Typography variant="body1" paragraph>{playerInfo.backstory}</Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" gutterBottom>Appearance</Typography>
                    <Typography variant="body2" paragraph>
                      {playerInfo.visualDescription.gender}, {playerInfo.visualDescription.bodyType}. {playerInfo.visualDescription.condition}.
                      Wearing {playerInfo.visualDescription.visibleClothing}.
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      {Object.entries(playerInfo.rpgElements).map(([categoryName, categoryValue]) => (
                        <Grid item xs={12} md={6} key={categoryName}>
                          <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                            {categoryName}
                          </Typography>
                          
                          {typeof categoryValue === 'object' ? (
                            // If it's a nested object with more key-values
                            Object.entries(categoryValue as Record<string, any>).map(([key, value]) => (
                              <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                  {key}:
                                </Typography>
                                <Typography variant="body1">{value.toString()}</Typography>
                              </Box>
                            ))
                          ) : (
                            // If it's a direct value
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                {categoryName}:
                              </Typography>
                              <Typography variant="body1">{categoryValue.toString()}</Typography>
                            </Box>
                          )}
                        </Grid>
                      ))}
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Money:</Typography>
                      <Typography variant="h6">${playerInfo.money}</Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Admin Dialog */}
          <Dialog 
            open={adminDialogOpen} 
            onClose={handleCloseAdminDialog}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminPanelSettingsIcon sx={{ mr: 2 }} />
                <Typography variant="h6">Game Admin Tools</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    fullWidth
                    onClick={handleValidateGameData}
                    disabled={adminActionLoading}
                  >
                    Validate Game Data
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    fullWidth
                    onClick={handleAutocreateReferences}
                    disabled={adminActionLoading}
                  >
                    Autocreate Dangling References
                  </Button>
                </Grid>
                {adminActionLoading && (
                  <Grid item xs={12} sx={{ textAlign: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                  </Grid>
                )}
                {adminActionResult && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Paper sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
                      <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                        {adminActionResult}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAdminDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      );
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
      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          boxShadow: 1,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleReturnToTitle}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
          {playerInfo?.name ? `${playerInfo.name}'s Adventure` : `Game #${gameId}`}
        </Typography>
        {hasPendingEntities && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              px: 2,
              py: 1,
              borderRadius: 1,
              animation: 'pulse 2s infinite'
            }}
          >
            <CircularProgress size={16} sx={{ mr: 1, color: 'inherit' }} />
            <Typography variant="body2">
              The world is being updated...
            </Typography>
          </Box>
        )}
      </Box>
      
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
          {/* Visible NPCs Section */}
          <Box
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  flexGrow: 1
                }}
                onClick={toggleNpcsExpanded}
              >
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Visible NPCs</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchVisibleNpcs();
                  }}
                  disabled={isNpcsLoading}
                  title="Refresh NPCs"
                >
                  {isNpcsLoading ? <CircularProgress size={18} /> : <RefreshIcon />}
                </IconButton>
                <IconButton size="small" onClick={toggleNpcsExpanded}>
                  {npcsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>
            
            <Collapse in={npcsExpanded}>
              <List
                sx={{
                  maxHeight: 280,
                  overflow: 'auto',
                  p: 0
                }}
              >
                {visibleNpcs.length === 0 ? (
                  <ListItem>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      No NPCs visible
                    </Typography>
                  </ListItem>
                ) : (
                  visibleNpcs.map((npc) => (
                    <ListItemButton
                      key={npc.id}
                      selected={selectedNpc?.id === npc.id && mainWindowView === 'npc-chat'}
                      onClick={() => handleSelectNpc(npc)}
                      sx={{
                        borderLeft: selectedNpc?.id === npc.id && mainWindowView === 'npc-chat'
                          ? `3px solid ${theme.palette.secondary.main}`
                          : '3px solid transparent'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: selectedNpc?.id === npc.id && mainWindowView === 'npc-chat'
                              ? 'secondary.main'
                              : 'primary.main',
                            mr: 1
                          }}
                        >
                          {npc.name.charAt(0)}
                        </Avatar>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: selectedNpc?.id === npc.id && mainWindowView === 'npc-chat'
                              ? 'bold'
                              : 'normal'
                          }}
                        >
                          {npc.name}
                        </Typography>
                      </Box>
                    </ListItemButton>
                  ))
                )}
              </List>
            </Collapse>
          </Box>
          
          {/* Inventory and Character Buttons */}
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant={mainWindowView === 'inventory' ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<InventoryIcon />}
              onClick={handleShowInventory}
              sx={{ mb: 2 }}
            >
              Inventory
              <Badge
                color="secondary"
                badgeContent={inventory.length}
                sx={{ ml: 1 }}
                max={99}
              />
            </Button>
            
            <Button
              fullWidth
              variant={mainWindowView === 'character' ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<PersonIcon />}
              onClick={handleShowCharacter}
            >
              Character Sheet
            </Button>
          </Box>
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
        <Box
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: theme.palette.background.paper
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Dungeon Master Chat
          </Typography>
        </Box>
        
        <Box
          sx={{
            flexGrow: 1,
            p: 2,
            overflow: 'auto',
            bgcolor: theme.palette.background.default
          }}
        >
          <List sx={{ width: '100%' }}>
            {dmMessages.map((message, index) => (
              renderMessage(message, index, index === dmMessages.length - 1)
            ))}
            <div ref={dmMessagesEndRef} />
          </List>
          
          {/* Loading indicator */}
          {isDmLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
        
        <Box
          component="form"
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(false);
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Talk to the Dungeon Master..."
              value={dmInput}
              onChange={handleDmInputChange}
              onKeyPress={(e) => handleKeyPress(e, false)}
              disabled={isDmLoading}
              multiline
              maxRows={3}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              onClick={() => handleSendMessage(false)}
              disabled={isDmLoading || !dmInput.trim()}
              sx={{ ml: 1, height: 55, borderRadius: 2, px: 3 }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
      
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