import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Grid, 
  CircularProgress, 
  Paper 
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface AdminDialogProps {
  open: boolean;
  isLoading: boolean;
  result: string | null;
  onClose: () => void;
  onValidateGameData: () => void;
  onAutocreateReferences: () => void;
}

const AdminDialog: React.FC<AdminDialogProps> = ({
  open,
  isLoading,
  result,
  onClose,
  onValidateGameData,
  onAutocreateReferences
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AdminPanelSettingsIcon sx={{ mr: 2 }} />
          <Typography variant="h6">Game Admin Tools</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Button 
              variant="contained" 
              color="primary"
              fullWidth
              onClick={onValidateGameData}
              disabled={isLoading}
            >
              Validate Game Data
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button 
              variant="contained" 
              color="secondary"
              fullWidth
              onClick={onAutocreateReferences}
              disabled={isLoading}
            >
              Autocreate Dangling References
            </Button>
          </Grid>
          {isLoading && (
            <Grid item xs={12} sx={{ textAlign: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Grid>
          )}
          {result && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, maxHeight: '300px', overflow: 'auto' }}>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                  {result}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminDialog; 