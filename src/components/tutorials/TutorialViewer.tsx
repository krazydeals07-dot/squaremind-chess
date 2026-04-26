import React, { useState } from 'react';
import { Tutorial } from '../../data/tutorials';
import { Box, Typography, IconButton } from '@mui/material';
import { Chessboard } from 'react-chessboard';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PieceRenderer from '../game/PieceRenderer';

interface TutorialViewerProps {
    tutorial: Tutorial;
}

const TutorialViewer: React.FC<TutorialViewerProps> = ({ tutorial }) => {
    const [step, setStep] = useState(0);

    if (tutorial.type === 'interactive' && tutorial.content) {
        const currentStep = tutorial.content[step];
        const squareStyles: { [key: string]: React.CSSProperties } = {};
        currentStep.highlight.forEach(square => {
            squareStyles[square] = { background: 'rgba(255, 255, 0, 0.4)' };
        });

        return (
            <Box sx={{ p: 2, background: '#1e2a38', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ mb: 1, fontFamily: 'Orbitron', fontWeight: 'bold' }}>{tutorial.title}</Typography>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Roboto', color: '#cfcfcf' }}>{currentStep.title}</Typography>
                
                <Box sx={{ width: '100%', maxWidth: 400, mb: 2 }}>
                    <Chessboard 
                        position={currentStep.fen} 
                        arePiecesDraggable={false}
                        customSquareStyles={squareStyles}
                        customPieces={PieceRenderer}
                        customDarkSquareStyle={{ backgroundColor: '#6B3F23' }}
                        customLightSquareStyle={{ backgroundColor: '#EAD8C3' }}
                        customBoardStyle={{ borderRadius: '8px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)' }}
                    />
                </Box>

                <Typography sx={{ mb: 2, textAlign: 'center', maxWidth: 400 }}>{currentStep.description}</Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 400, mt: 1 }}>
                    <IconButton onClick={() => setStep(s => s - 1)} disabled={step === 0}>
                        <ArrowBackIosNewIcon sx={{color: "white"}}/>
                    </IconButton>
                    <Typography>{step + 1} / {tutorial.content.length}</Typography>
                    <IconButton onClick={() => setStep(s => s + 1)} disabled={step === tutorial.content.length - 1}>
                        <ArrowForwardIosIcon sx={{color: "white"}}/>
                    </IconButton>
                </Box>
            </Box>
        );
    } else if (tutorial.type === 'video') {
        return (
            <Box sx={{ p: 2, background: 'black' }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white', fontFamily: 'Orbitron' }}>{tutorial.title}</Typography>
                <Box sx={{ 
                    position: 'relative',
                    paddingBottom: '56.25%', 
                    height: 0,
                    overflow: 'hidden',
                    maxWidth: '100%', 
                    background: '#000' 
                }}>
                    <iframe 
                        src={`https://www.youtube.com/embed/${tutorial.videoId}`}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        title={tutorial.title}
                        style={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%' 
                        }}
                    />
                </Box>
            </Box>
        );
    } 
    
    return null;
};

export default TutorialViewer;