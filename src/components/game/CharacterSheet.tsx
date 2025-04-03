import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Grid, 
  IconButton 
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
};

export default CharacterSheet; 