
import { Box, Avatar, Typography, LinearProgress, Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import React from 'react';

interface ProfileHeaderProps {
    photoURL: string | null;
    displayName: string;
    level: number;
    isEditing: boolean;
    onEditToggle: () => void;
}

const ProfileHeader = ({ photoURL, displayName, level, isEditing, onEditToggle }: ProfileHeaderProps) => {
    const levelProgress = level ? (level - Math.floor(level)) * 100 : 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <Avatar
                src={photoURL || ''}
                sx={{
                    width: { xs: 120, md: 180 },
                    height: { xs: 120, md: 180 },
                    mb: 2,
                    border: '5px solid #FFA500',
                    boxShadow: '0 0 20px #FFA500'
                }}
            >
                <Typography variant="h1" sx={{ fontFamily: '"Orbitron", sans-serif', fontSize: { xs: '4rem', md: '6rem' } }}>
                    {displayName?.charAt(0)?.toUpperCase() || 'U'}
                </Typography>
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontFamily: '"Orbitron", sans-serif', color: '#FFA500', fontWeight: 'bold' }}>
                {displayName}
            </Typography>
            <Typography sx={{ color: '#08d4b4', fontFamily: '"Orbitron", sans-serif', mb: 2 }}>
                {`Level ${Math.floor(level)}`}
            </Typography>
            <Box sx={{ width: '90%', mb: 3 }}>
                <LinearProgress
                    variant="determinate"
                    value={levelProgress}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #E03D00, #FFA500)',
                            boxShadow: '0 0 10px #FFA500'
                        }
                    }}
                />
            </Box>
            <Button
                variant="contained"
                startIcon={<Edit />}
                sx={{
                    fontFamily: '"Orbitron", sans-serif',
                    bgcolor: isEditing ? '#E03D00' : '#08d4b4',
                    '&:hover': { bgcolor: isEditing ? '#FFA500' : '#07bfa0' },
                    borderRadius: '12px',
                    px: 3,
                    py: 1
                }}
                onClick={onEditToggle}
            >
                {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
        </Box>
    );
}

export default React.memo(ProfileHeader);
