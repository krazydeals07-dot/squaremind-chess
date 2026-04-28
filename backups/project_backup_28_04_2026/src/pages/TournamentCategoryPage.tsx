
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Card, CardContent, CardActions, Button, Chip, Icon } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getTournamentsRT, Tournament } from '../utils/firebase/tournaments';
import PageLayout from '../components/StaticPageLayout';
import { AccessTime, People, EmojiEvents, CheckCircle } from '@mui/icons-material';

const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
    const startDate = tournament.startDate?.toDate ? tournament.startDate.toDate() : new Date(tournament.startDate);

    const getStatusChip = () => {
        switch (tournament.status) {
            case 'ongoing':
                return <Chip label="Live" color="error" size="small" sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 'bold' }} />;
            case 'upcoming':
                return <Chip label="Upcoming" color="primary" size="small" sx={{ position: 'absolute', top: 16, right: 16, fontWeight: 'bold' }} />;
            case 'completed':
                return <Chip label="Finished" color="default" size="small" sx={{ position: 'absolute', top: 16, right: 16 }} />;
            default:
                return null;
        }
    }

    return (
        <Grid item xs={12} md={6} lg={4}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '12px', position: 'relative', transition: 'transform 0.2s', '&:hover': {transform: 'scale(1.03)'} }}>
                {getStatusChip()}
                <CardContent sx={{ flexGrow: 1, pb: 0 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {tournament.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                        <AccessTime sx={{ mr: 1, fontSize: '1rem' }} />
                        <Typography variant="body2">{startDate.toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 2 }}>
                        <People sx={{ mr: 1, fontSize: '1rem' }} />
                        <Typography variant="body2">
                            {tournament.players?.length || 0} / {tournament.maxPlayers} Players
                        </Typography>
                    </Box>
                     <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                        <Chip icon={<EmojiEvents />} label={tournament.type} color="secondary" size="small" />
                        <Chip label={`${tournament.timeControl}`} color="info" size="small" />
                     </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {tournament.description}
                    </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                    <Button component={RouterLink} to={`/tournament/${tournament.id}`} variant="contained" color="primary">
                        View Details
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );
};


interface TournamentCategoryPageProps {
    title: string;
    filterFn: (tournament: Tournament) => boolean;
}

const TournamentCategoryPage: React.FC<TournamentCategoryPageProps> = ({ title, filterFn }) => {
    const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = getTournamentsRT(
            (data) => {
                setAllTournaments(data);
                setLoading(false);
            },
            (err) => {
                setError('Failed to load tournaments.');
                setLoading(false);
                console.error(err);
            }
        );
        return () => unsubscribe();
    }, []);

    const filteredTournaments = useMemo(() => allTournaments.filter(filterFn), [allTournaments, filterFn]);

    return (
        <PageLayout title={title}>
             {loading && <CircularProgress />}
             {error && <Alert severity="error">{error}</Alert>}
             {!loading && !error && (
                 filteredTournaments.length > 0 ? (
                    <Grid container spacing={4}>
                        {filteredTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
                    </Grid>
                 ) : (
                    <Typography variant="h6" color="text.secondary" align="center">
                        No tournaments found in this category right now. Check back later!
                    </Typography>
                 )
             )}
        </PageLayout>
    );
};

export default TournamentCategoryPage;
