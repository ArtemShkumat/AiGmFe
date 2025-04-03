import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItemButton, 
  Avatar, 
  IconButton, 
  CircularProgress, 
  Collapse, 
  ListItem,
  useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import { NPC } from '../../types';

interface NPCListProps {
  visibleNpcs: NPC[];
  selectedNpc: NPC | null;
  mainWindowView: string;
  npcsExpanded: boolean;
  isNpcsLoading: boolean;
  onToggleNpcsExpanded: () => void;
  onSelectNpc: (npc: NPC) => void;
  onRefreshNpcs: () => void;
}

const NPCList: React.FC<NPCListProps> = ({
  visibleNpcs,
  selectedNpc,
  mainWindowView,
  npcsExpanded,
  isNpcsLoading,
  onToggleNpcsExpanded,
  onSelectNpc,
  onRefreshNpcs
}) => {
  const theme = useTheme();

  return (
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
          onClick={onToggleNpcsExpanded}
        >
          <PeopleIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Visible NPCs</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onRefreshNpcs();
            }}
            disabled={isNpcsLoading}
            title="Refresh NPCs"
          >
            {isNpcsLoading ? <CircularProgress size={18} /> : <RefreshIcon />}
          </IconButton>
          <IconButton size="small" onClick={onToggleNpcsExpanded}>
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
                onClick={() => onSelectNpc(npc)}
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
  );
};

export default NPCList; 