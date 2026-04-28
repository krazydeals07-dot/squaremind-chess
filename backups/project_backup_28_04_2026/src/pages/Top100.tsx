import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab, TextField, InputAdornment, IconButton, Avatar, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { globalPlayers, indiaPlayers, Player } from '../data/players';

const PlayerList = ({ players }: { players: Player[] }) => {
    if (players.length === 0) {
        return (
            <Typography align="center" sx={{ mt: 4, color: 'rgba(255, 255, 255, 0.7)' }}>
                No players found.
            </Typography>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            {players.map((player, index) => (
                <motion.div
                    key={`${player.name}-${player.rank}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', py: 1.5, px: 1 }}>
                        <Box sx={{ 
                            width: '60px', 
                            textAlign: 'center', 
                            color: '#FFA500', 
                            fontWeight: 'bold', 
                            fontSize: '1.1rem' 
                        }}>
                            #{player.rank}
                        </Box>
                        <Avatar alt={player.name} src={player.avatar} sx={{ width: 48, height: 48, border: '2px solid #FFA500', ml: 1, mr: 2 }}/>
                        <Box sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                            {player.name}
                        </Box>
                    </Box>
                    {index < players.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}/>}
                </motion.div>
            ))}
        </Box>
    );
};


const Top100 = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
        setSearchTerm('');
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const playersToShow = selectedTab === 0 ? globalPlayers : indiaPlayers;
    const filteredPlayers = playersToShow.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
             <Paper elevation={10} sx={{ p: { xs: 2, sm: 3 }, background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderRadius: '15px', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontFamily: 'Orbitron', color: '#FFA500', fontWeight: 'bold' }}>
                        Leaderboard
                    </Typography>
                    <Box sx={{ width: 48 }} /> {/* Spacer for centering title */}
                </Box>
                
                <Tabs 
                    value={selectedTab} 
                    onChange={handleTabChange} 
                    centered
                    TabIndicatorProps={{ style: { backgroundColor: '#FFA500' } }}
                    sx={{ borderBottom: 1, borderColor: 'rgba(255, 165, 0, 0.3)', mb: 3 }}
                >
                    <Tab label="Global" sx={{ color: selectedTab === 0 ? '#FFA500' : 'white', fontFamily: 'Orbitron', fontWeight: 'bold' }} />
                    <Tab label="India" sx={{ color: selectedTab === 1 ? '#FFA500' : 'white', fontFamily: 'Orbitron', fontWeight: 'bold' }} />
                </Tabs>

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search player..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                color: '#FFA500',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                                '& fieldset': {
                                    borderColor: 'rgba(255, 165, 0, 0.4)',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#FFA500',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#FFD700',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: 'white',
                            },
                            '& .MuiInputBase-input::placeholder': {
                                color: 'rgba(255, 255, 255, 0.6)',
                                opacity: 1,
                            },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <PlayerList players={filteredPlayers} />

            </Paper>
        </Box>
    );
};

export default Top100;
