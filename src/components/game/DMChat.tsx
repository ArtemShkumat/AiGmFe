import React, { useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  List, 
  CircularProgress 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Message } from '../../types';
import MessageBubble from './MessageBubble';

interface DMChatProps {
  messages: Message[];
  dmInput: string;
  isDmLoading: boolean;
  onDmInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  onSendMessage: () => void;
}

const DMChat: React.FC<DMChatProps> = ({
  messages,
  dmInput,
  isDmLoading,
  onDmInputChange,
  onKeyPress,
  onSendMessage
}) => {
  const dmMessagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    dmMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <Box
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
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
          bgcolor: 'background.default'
        }}
      >
        <List sx={{ width: '100%' }}>
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}
          <div ref={dmMessagesEndRef} />
        </List>
        
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
          onSendMessage();
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Talk to the Dungeon Master..."
            value={dmInput}
            onChange={onDmInputChange}
            onKeyPress={onKeyPress}
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
            onClick={onSendMessage}
            disabled={isDmLoading || !dmInput.trim()}
            sx={{ ml: 1, height: 55, borderRadius: 2, px: 3 }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default DMChat; 