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
  Badge
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // UI State
  const [mainWindowView, setMainWindowView] = useState<MainWindowView>('npc-chat');
  const [npcsExpanded, setNpcsExpanded] = useState(true);
  const [selectedNpc, setSelectedNpc] = useState<NPC | null>(null);
  const [visibleNpcs, setVisibleNpcs] = useState<NPC[]>([]);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [npcChats, setNpcChats] = useState<Map<string, Message[]>>(new Map());
  
  // Initialize game state
  useEffect(() => {
    if (gameId) {
      // Load DM welcome message
      if (dmMessages.length === 0) {
        setDmMessages([
          {
            from: 'dm',
            text: 'Welcome to your adventure! I am your Dungeon Master. What would you like to do?',
            timestamp: new Date()
          }
        ]);
      }
      
      // Fetch initial game data
      fetchGameData();
    } else {
      setError('Game ID is missing. Please return to the title screen.');
      setOpenSnackbar(true);
    }
  }, [gameId]);
  
  // Fetch game data from API
  const fetchGameData = async () => {
    if (!gameId) return;
    
    try {
      setIsLoading(true);
      
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
        
        // If no conversation log, add greeting
        if (initialMessages.length === 0) {
          initialMessages.push({
            from: 'npc',
            text: `Hello there. I'm ${npc.name}.`,
            npcId: npc.id,
            npcName: npc.name,
            timestamp: new Date()
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
      setIsLoading(false);
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
  
  // Send message to DM or NPC
  const handleSendMessage = useCallback(async (isNpcChat: boolean = false) => {
    if (!gameId) {
      setError('Game ID is missing. Please return to the title screen.');
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
    setIsLoading(true);
    
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
          promptType: PromptType.NPC
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
        
        // Refresh game data after DM interaction to update state
        fetchGameData();
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to send user input:', err);
      setError('Failed to get response from the game. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, npcInput, dmInput, selectedNpc, npcChats]);
  
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
            
            {isLoading && (
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
                disabled={isLoading}
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
                disabled={isLoading || !npcInput.trim()}
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
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <PersonIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Character Sheet</Typography>
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
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onClick={toggleNpcsExpanded}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Visible NPCs</Typography>
              </Box>
              <IconButton size="small">
                {npcsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
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
          {isLoading && (
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
              disabled={isLoading}
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
              disabled={isLoading || !dmInput.trim()}
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