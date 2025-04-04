import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton,
  Dialog, 
  DialogTitle, 
  DialogContent,
  CircularProgress
} from '@mui/material';
import api from '../api/api';
import { Game } from '../types';

const TitlePage: React.FC = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing games when dialog opens
  const handleLoadGameClick = useCallback(async () => {
    setOpenDialog(true);
    
    // Only fetch games if we haven't already loaded them or if there was an error
    if (games.length === 0 || error) {
      setLoading(true);
      try {
        const gamesData = await api.listGames();
        setGames(gamesData);
        setError(null);
      } catch (err) {
        console.error('Failed to load games:', err);
        setError('Failed to load games. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  }, [games.length, error]);

  const handleGameSelect = useCallback((gameId: string) => {
    navigate(`/game/${gameId}`);
  }, [navigate]);

  const handleNewGame = useCallback(() => {
    navigate('/new-game');
  }, [navigate]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  return (
    <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Paper 
        elevation={3} 
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(30, 30, 30, 0.95)',
          border: '1px solid #333',
        }}
      >
        <Typography variant="h1" component="h1" align="center" gutterBottom>
          Text RPG Adventure
        </Typography>
        
        <Typography variant="h3" component="h2" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
          LLM-Powered Journey
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleNewGame}
            sx={{ 
              py: 1.5, 
              px: 4, 
              fontSize: '1.2rem',
              minWidth: '180px' 
            }}
          >
            New Game
          </Button>
          
          <Button 
            variant="outlined" 
            size="large" 
            onClick={handleLoadGameClick}
            sx={{ 
              py: 1.5, 
              px: 4, 
              fontSize: '1.2rem',
              minWidth: '180px' 
            }}
          >
            Load Game
          </Button>
        </Box>
      </Paper>

      {/* Load Game Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: { 
            minWidth: '400px',
            maxWidth: '600px',
            maxHeight: '80vh',
            bgcolor: 'background.paper'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5">Load Game</Typography>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : games.length === 0 ? (
            <Typography>No saved games found. Start a new adventure!</Typography>
          ) : (
            <List sx={{ width: '100%' }}>
              {games.map((game) => (
                <ListItem key={game.gameId} disablePadding>
                  <ListItemButton
                    onClick={() => handleGameSelect(game.gameId)}
                    sx={{ 
                      border: '1px solid #333',
                      mb: 1,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'rgba(124, 77, 255, 0.1)',
                      }
                    }}
                  >
                    <ListItemText 
                      primary={game.name} 
                      secondary={
                        <>
                          <Typography component="span" variant="body2" display="block">
                            Character: {game.playerName}
                          </Typography>
                          <Typography component="span" variant="body2" display="block">
                            Location: {game.playerLocation}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.secondary" display="block">
                            Game ID: {game.gameId}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TitlePage; 