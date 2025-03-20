import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Snackbar,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import api from '../api/api';
import { Scenario, GamePreferences } from '../types';

const NewGameFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Form state
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [gamePreferences, setGamePreferences] = useState<GamePreferences>({
    tone: 'neutral',
    complexity: 'medium',
    ageAppropriateness: 'mature'
  });
  const [characterDescription, setCharacterDescription] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);
  
  // Load scenarios only once on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchScenarios = async () => {
      if (isLoading) return; // Prevent duplicate requests
      
      setIsLoading(true);
      try {
        const scenariosData = await api.getScenarios();
        if (isMounted) {
          setScenarios(scenariosData);
          if (scenariosData.length > 0) {
            setSelectedScenario(scenariosData[0].scenarioId);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch scenarios:', err);
          setError('Failed to load scenarios. Please try again.');
          setOpenSnackbar(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchScenarios();
    
    // Cleanup function to handle component unmount
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to ensure it runs only once
  
  const handleScenarioChange = useCallback((event: SelectChangeEvent) => {
    setSelectedScenario(event.target.value);
  }, []);
  
  const handlePreferenceChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    if (name) {
      setGamePreferences((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);
  
  const handleCharacterDescriptionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCharacterDescription(event.target.value);
  }, []);
  
  const handleCreateGame = useCallback(async () => {
    if (!selectedScenario) {
      setError('Please select a scenario first.');
      setOpenSnackbar(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const newGameId = await api.createGame({
        scenarioId: selectedScenario,
        gamePreferences
      });
      setGameId(newGameId);
      setActiveStep(1); // Move to character creation step
      setError(null);
    } catch (err) {
      console.error('Failed to create game:', err);
      setError('Failed to create game. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedScenario, gamePreferences, setOpenSnackbar]);
  
  const handleCreateCharacter = useCallback(async () => {
    if (!gameId) {
      setError('Game ID is missing. Please go back and try again.');
      setOpenSnackbar(true);
      return;
    }
    
    if (!characterDescription.trim()) {
      setError('Please describe your character before proceeding.');
      setOpenSnackbar(true);
      return;
    }
    
    setIsLoading(true);
    try {
      await api.createCharacter({
        gameId,
        characterDescription
      });
      // Success - move to the game page
      navigate(`/game/${gameId}`);
    } catch (err) {
      console.error('Failed to create character:', err);
      setError('Failed to create character. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, characterDescription, navigate, setOpenSnackbar]);
  
  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => prevStep - 1);
  }, []);
  
  const handleCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);
  
  const handleCloseSnackbar = useCallback(() => {
    setOpenSnackbar(false);
  }, []);
  
  // Step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Choose a Scenario & Game Preferences
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
              <InputLabel id="scenario-select-label">Scenario</InputLabel>
              <Select
                labelId="scenario-select-label"
                id="scenario-select"
                value={selectedScenario}
                onChange={handleScenarioChange}
                label="Scenario"
              >
                {scenarios.map((scenario) => (
                  <MenuItem key={scenario.scenarioId} value={scenario.scenarioId}>
                    {scenario.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select the world setting for your adventure</FormHelperText>
            </FormControl>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Game Preferences
            </Typography>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Tone</Typography>
              <RadioGroup
                row
                name="tone"
                value={gamePreferences.tone}
                onChange={handlePreferenceChange}
              >
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="neutral" control={<Radio />} label="Neutral" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Complexity</Typography>
              <RadioGroup
                row
                name="complexity"
                value={gamePreferences.complexity}
                onChange={handlePreferenceChange}
              >
                <FormControlLabel value="low" control={<Radio />} label="Low" />
                <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                <FormControlLabel value="high" control={<Radio />} label="High" />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset" sx={{ mb: 4 }}>
              <Typography variant="subtitle1">Age Appropriateness</Typography>
              <RadioGroup
                row
                name="ageAppropriateness"
                value={gamePreferences.ageAppropriateness}
                onChange={handlePreferenceChange}
              >
                <FormControlLabel value="child" control={<Radio />} label="Child Friendly" />
                <FormControlLabel value="teen" control={<Radio />} label="Teen" />
                <FormControlLabel value="mature" control={<Radio />} label="Mature" />
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleCancel} color="inherit">
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateGame}
                disabled={isLoading || !selectedScenario}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Create Game'}
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Describe Your Character
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Describe your character in detail - their appearance, background, personality, skills, etc. 
              The AI will create a game-ready character from your description.
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={8}
              variant="outlined"
              placeholder="E.g. A tall elven ranger with keen senses and an affinity for nature. Raised in the deep forests by a reclusive druid, she's skilled with a bow and can communicate with animals. She's seeking adventure to find rare herbs that could cure her village's mysterious illness."
              value={characterDescription}
              onChange={handleCharacterDescriptionChange}
              sx={{ mb: 4 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack} color="inherit">
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateCharacter}
                disabled={isLoading || !characterDescription.trim()}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Create Character & Start Game'}
              </Button>
            </Box>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create New Adventure
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4, pt: 2 }}>
          <Step>
            <StepLabel>Choose Scenario</StepLabel>
          </Step>
          <Step>
            <StepLabel>Create Character</StepLabel>
          </Step>
        </Stepper>
        
        {getStepContent(activeStep)}
      </Paper>
      
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewGameFlowPage; 