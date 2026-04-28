import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Paper,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';

import {
  ExpandMore as ExpandMoreIcon,
  OndemandVideo as OndemandVideoIcon,
  Extension as ExtensionIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import { tutorials, Tutorial } from '../data/tutorials';
import { useAuth } from '../contexts/AuthContext';
import TutorialViewer from '../components/tutorials/TutorialViewer';

const TutorialsPage: React.FC = () => {
  const { isGuest } = useAuth();
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const tutorialsByLevel = tutorials.reduce((acc, tutorial) => {
    if (!acc[tutorial.level]) {
      acc[tutorial.level] = [];
    }
    acc[tutorial.level].push(tutorial);
    return acc;
  }, {} as Record<string, Tutorial[]>);

  const levels: ('Beginner' | 'Intermediate' | 'Advanced')[] = [
    'Beginner',
    'Intermediate',
    'Advanced',
  ];

  const handleTutorialClick = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
  };

  const handleClose = () => {
    setSelectedTutorial(null);
  };

  return (
    <Box
      sx={{
        p: { xs: 1, md: 1 },
        background: 'linear-gradient(to bottom, #2c3e50, #4a6a8a)',
        color: 'white',
        minHeight: 'auto',
      }}
    >
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        component="h1"
        sx={{
          mb: { xs: 1, md: 2 },
          textAlign: 'center',
          fontFamily: 'Orbitron',
          fontWeight: 'bold',
          color: '#FFA500',
          textTransform: 'uppercase',
        }}
      >
        Chess Tutorials
      </Typography>

      {levels.map((level) => {
        const isDisabled = isGuest && level !== 'Beginner';

        return (
          <Accordion
            key={level}
            defaultExpanded={level === 'Beginner'}
            disabled={isDisabled}
            sx={{
              background: 'rgba(30, 40, 50, 0.85)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              mb: 1,
              borderRadius: '10px',
              '&.Mui-disabled': {
                background: 'rgba(30, 40, 50, 0.5)',
                color: 'grey',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{ minHeight: '48px', '& .MuiAccordionSummary-content': { my: 1 } }}
            >
              <Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron', fontWeight: 'bold' }}>
                {level}
                {isDisabled && (
                  <Chip size="small" label="Guest limit" sx={{ ml: 1 }} />
                )}
              </Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}
            >
              {tutorialsByLevel[level]?.map((tutorial) => (
                <Paper
                  key={tutorial.id}
                  onClick={() => handleTutorialClick(tutorial)}
                  sx={{
                    p: 1,
                    background: 'rgba(0, 0, 0, 0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.4)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    {tutorial.type === 'video' ? (
                      <OndemandVideoIcon sx={{ mr: 1, color: '#FFA500', fontSize: '1.2rem' }} />
                    ) : (
                      <ExtensionIcon sx={{ mr: 1, color: '#FFA500', fontSize: '1.2rem' }} />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {tutorial.title}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    {tutorial.description}
                  </Typography>
                </Paper>
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Dialog
        open={!!selectedTutorial}
        onClose={handleClose}
        fullScreen={isMobile}
        fullWidth
        maxWidth="md"
        sx={{ backdropFilter: 'blur(5px)' }}
      >
        <DialogContent sx={{ p: 0, background: '#1e2a38' }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>

          {selectedTutorial && (
            <TutorialViewer tutorial={selectedTutorial} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TutorialsPage;