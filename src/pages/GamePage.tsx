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
  Divider,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api/api';
import { Message, PromptType } from '../types';

const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Initialize with a welcome message from the DM
  useEffect(() => {
    if (gameId) {
      // Add initial DM welcome message only when messages array is empty
      if (messages.length === 0) {
        setMessages([
          {
            from: 'dm',
            text: 'Welcome to your adventure! I am your Dungeon Master. What would you like to do?',
            timestamp: new Date()
          }
        ]);
      }
    } else {
      setError('Game ID is missing. Please return to the title screen.');
      setOpenSnackbar(true);
    }
  }, [gameId, messages.length]);
  
  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleUserInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };
  
  // Use useCallback to prevent unnecessary re-renders
  const handleSendMessage = useCallback(async () => {
    if (!gameId) {
      setError('Game ID is missing. Please return to the title screen.');
      setOpenSnackbar(true);
      return;
    }
    
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;
    
    // Add user message to chat
    const userMessage: Message = {
      from: 'player',
      text: trimmedInput,
      timestamp: new Date()
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Call API with user input
      const response = await api.sendUserInput({
        gameId,
        userInput: trimmedInput,
        promptType: PromptType.DM
      });
      
      // Add DM response to chat
      const dmResponse: Message = {
        from: 'dm',
        text: response,
        timestamp: new Date()
      };
      
      setMessages((prevMessages) => [...prevMessages, dmResponse]);
      setError(null);
    } catch (err) {
      console.error('Failed to send user input:', err);
      setError('Failed to get response from the game. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, userInput]);
  
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  const handleReturnToTitle = () => {
    navigate('/');
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
          Game #{gameId}
        </Typography>
      </Box>
      
      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          overflow: 'auto',
          bgcolor: theme.palette.background.default
        }}
      >
        <List sx={{ width: '100%' }}>
          {messages.map((message, index) => (
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
                  {message.from === 'player' ? 'You' : 'Dungeon Master'}
                </Typography>
                
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    maxWidth: '80%',
                    bgcolor: message.from === 'player' ? 'primary.dark' : 'background.paper',
                    border: `1px solid ${message.from === 'player' ? theme.palette.primary.main : '#333'}`
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
              {index < messages.length - 1 && (
                <Divider variant="middle" sx={{ my: 1, opacity: 0.2 }} />
              )}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
        
        {/* Loading indicator */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
      
      {/* Input Area */}
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
          handleSendMessage();
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="What do you want to do or say?"
            value={userInput}
            onChange={handleUserInputChange}
            onKeyPress={handleKeyPress}
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
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            sx={{ ml: 1, height: 55, borderRadius: 2, px: 3 }}
          >
            Send
          </Button>
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