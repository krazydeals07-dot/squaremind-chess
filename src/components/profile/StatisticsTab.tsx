
import { Box, Divider } from '@mui/material';
import StatsCategory from './StatsCategory';
import { EmojiPeople, People, EmojiEvents } from '@mui/icons-material';
import { UserProfile } from '../../types';
import React from 'react';

interface StatisticsTabProps {
    userProfile: UserProfile;
}

const StatisticsTab = ({ userProfile }: StatisticsTabProps) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 }, p: { xs: 1, md: 2 } }}>
        <StatsCategory title="Play with AI" stats={userProfile.aiStats} icon={<EmojiPeople />} />
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <StatsCategory title="Play with Friends" stats={userProfile.friendsStats} icon={<People />} />
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <StatsCategory title="Tournaments" stats={userProfile.tournamentsStats} icon={<EmojiEvents />} />
    </Box>
);

export default React.memo(StatisticsTab);
