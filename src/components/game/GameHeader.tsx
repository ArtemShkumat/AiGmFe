import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  CircularProgress 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PlayerInfo } from '../../types';

interface GameHeaderProps {
  playerInfo: PlayerInfo | null;
  gameId: string | undefined;
  hasPendingEntities: boolean;
  onReturnToTitle: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
  playerInfo, 
  gameId, 
  hasPendingEntities, 
  onReturnToTitle 
}) => {
  return (
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
        onClick={onReturnToTitle}
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
  );
};

export default GameHeader; 