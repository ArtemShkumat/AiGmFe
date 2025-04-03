import React from 'react';
import { Box, Button, Badge } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonIcon from '@mui/icons-material/Person';

interface SidebarControlsProps {
  mainWindowView: string;
  inventoryCount: number;
  onShowInventory: () => void;
  onShowCharacter: () => void;
}

const SidebarControls: React.FC<SidebarControlsProps> = ({
  mainWindowView,
  inventoryCount,
  onShowInventory,
  onShowCharacter
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Button
        fullWidth
        variant={mainWindowView === 'inventory' ? 'contained' : 'outlined'}
        color="primary"
        startIcon={<InventoryIcon />}
        onClick={onShowInventory}
        sx={{ mb: 2 }}
      >
        Inventory
        <Badge
          color="secondary"
          badgeContent={inventoryCount}
          sx={{ ml: 1 }}
          max={99}
        />
      </Button>
      
      <Button
        fullWidth
        variant={mainWindowView === 'character' ? 'contained' : 'outlined'}
        color="primary"
        startIcon={<PersonIcon />}
        onClick={onShowCharacter}
      >
        Character Sheet
      </Button>
    </Box>
  );
};

export default SidebarControls; 