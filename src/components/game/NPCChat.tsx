import React, { useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  Avatar, 
  CircularProgress 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Message, NPC } from '../../types';
import MessageBubble from './MessageBubble';

interface NPCChatProps {
  selectedNpc: NPC;
  messages: Message[];
  npcInput: string;
  isNpcLoading: boolean;
  onNpcInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  onSendMessage: () => void;
}

const NPCChat: React.FC<NPCChatProps> = ({
  selectedNpc,
  messages,
  npcInput,
  isNpcLoading,
  onNpcInputChange,
  onKeyPress,
  onSendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        bgcolor: 'background.default'
      }}>
        <List sx={{ width: '100%' }}>
          {messages.map((message, index) => (
            <MessageBubble 
              key={index} 
              message={message} 
              isLast={index === messages.length - 1} 
            />
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
          onSendMessage();
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Say something to this character..."
            value={npcInput}
            onChange={onNpcInputChange}
            onKeyPress={onKeyPress}
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
            onClick={onSendMessage}
            disabled={isNpcLoading || !npcInput.trim()}
            sx={{ ml: 1, height: 55, borderRadius: 2, px: 3 }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default NPCChat; 