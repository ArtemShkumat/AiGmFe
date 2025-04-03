import React from 'react';
import { Typography, Paper, ListItem, useTheme } from '@mui/material';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const theme = useTheme();
  
  return (
    <React.Fragment>
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
        <div style={{ height: '8px' }} />
      )}
    </React.Fragment>
  );
};

export default MessageBubble; 