import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Grid, 
  IconButton,
  Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { PlayerInfo } from '../../types';

interface CharacterSheetProps {
  playerInfo: PlayerInfo | null;
  onOpenAdminDialog: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ 
  playerInfo, 
  onOpenAdminDialog 
}) => {
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
          onClick={onOpenAdminDialog} 
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
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Character Tags</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {playerInfo.rpgTags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag.name}
                          title={tag.description}
                          color="primary"
                          variant="outlined"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Grid>
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
};

export default CharacterSheet; 