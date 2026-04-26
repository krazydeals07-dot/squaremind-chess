import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Match, Player } from '../utils/firebase/tournaments';

interface TournamentBracketProps {
  matches: Match[];
  players: Player[];
}

const MatchCard = ({ match }: { match: Match }) => {
  const player1Name = match.player1 ? match.player1.displayName : 'TBD';
  const player2Name = match.player2 ? match.player2.displayName : 'TBD';

  return (
    <Paper elevation={3} sx={{ p: 2, m: 1, minWidth: 200 }}>
      <Typography variant="body1">{player1Name}</Typography>
      <Typography variant="body2" sx={{ my: 1 }}>vs</Typography>
      <Typography variant="body1">{player2Name}</Typography>
    </Paper>
  );
};

const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches, players }) => {
  if (!matches || matches.length === 0) {
    return <Typography>No matches to display.</Typography>;
  }

  const rounds = matches.reduce((acc, match) => {
    (acc[match.round] = acc[match.round] || []).push(match);
    return acc;
  }, {} as { [key: number]: Match[] });

  return (
    <Box sx={{ display: 'flex', overflowX: 'auto', p: 2 }}>
      {Object.keys(rounds).map(roundNumber => (
        <Box key={roundNumber} sx={{ mr: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Round {roundNumber}</Typography>
          <Box>
            {rounds[Number(roundNumber)].map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default TournamentBracket;
