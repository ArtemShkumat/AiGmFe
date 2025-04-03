import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid 
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import { InventoryItem } from '../../types';

interface InventoryDisplayProps {
  inventory: InventoryItem[];
}

const InventoryDisplay: React.FC<InventoryDisplayProps> = ({ inventory }) => {
  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <InventoryIcon sx={{ mr: 2 }} />
        <Typography variant="h6">Inventory</Typography>
      </Box>
      
      <Box sx={{ p: 3, overflow: 'auto' }}>
        {inventory.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            Your inventory is empty.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {inventory.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.name} {item.quantity > 1 && `(${item.quantity})`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
};

export default InventoryDisplay; 