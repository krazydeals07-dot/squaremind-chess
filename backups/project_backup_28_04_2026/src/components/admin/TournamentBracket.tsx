tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Match } from '../../utils/firebase/tournaments';

interface TournamentBracketProps {
  matches: Match[];
}

const BracketContainer = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  padding: '40px 20px',
  color: 'white',
  background: '#0A1F44',
  minHeight: '600px',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#FF6F00',
    borderRadius: '4px',
  },
});

const RoundContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  margin: '0 40px',
  minWidth: '180px',
}));

const MatchContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'round' && prop !== 'isFirstRound' && prop !== 'isLastRound'
})<{ round: number; isFirstRound: boolean; isLastRound: boolean }>(({ round, isFirstRound, isLastRound }) => ({
  background: '#1A3A6D',
  color: 'white',
  padding: '12px 10px',
  margin: '20px 0',
  width: '180px',
  position: 'relative',
  border: '1px solid #FF6F00',
  borderRadius: '8px',
  zIndex: 1,
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',

  // Connector line to the right
  ...(!isLastRound && {
    '&::after': {
      content: '""',
      position: 'absolute',
      right: '-41px',
      top: '50%',
      width: '40px',
      height: '2px',
      backgroundColor: '#FF6F00',
    }
  }),

  // Vertical connector line for pairing
  ...(!isLastRound && {
    '&.match-even::after': {
      height: 'calc(50% + 42px)', // Dynamic height based on round would be better but this is a CSS baseline
      borderRight: '2px solid #FF6F00',
      borderTopRightRadius: '8px',
    },
    '&.match-odd::after': {
      height: 'calc(50% + 42px)',
      top: 'auto',
      bottom: '50%',
      borderRight: '2px solid #FF6F00',
      borderBottomRightRadius: '8px',
    }
  }),

  // Connector line from the left
  ...(!isFirstRound && {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: '-41px',
      top: '50%',
      width: '40px',
      height: '2px',
      backgroundColor: '#FF6F00',
    }
  })
}));

const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches }) => {

  if (!matches || matches.length === 0) {
    return <Typography sx={{ color: 'white', p: 4 }}>Bracket has not been generated yet.</Typography>;
  }

  const rounds: Record<number, Match[]> = matches.reduce((acc, match) => {
    const round = match.round || 1;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const totalRounds = Object.keys(rounds).length;

  for (const round in rounds) {
    rounds[round].sort((a, b) => (a.matchIndex || 0) - (b.matchIndex || 0));
  }

  const getPlayerStyle = (isWinner: boolean) => ({
    padding: '6px 8px',
    background: isWinner ? '#FF6F00' : 'transparent',
    borderRadius: '4px',
    color: isWinner ? 'black' : 'white',
    fontWeight: isWinner ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
    boxShadow: isWinner ? '0 0 10px #FF6F00' : 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  });

  return (
    <BracketContainer>
      {Object.keys(rounds).sort((a, b) => Number(a) - Number(b)).map(roundKey => {
        const roundNumber = parseInt(roundKey, 10);
        const roundMatches = rounds[roundNumber];
        const isFirstRound = roundNumber === 1;
        const isLastRound = roundNumber === totalRounds;

        return (
          <RoundContainer key={roundNumber}>
            <Typography variant="h6" sx={{ color: '#FF6F00', fontSize: '1.1rem', fontWeight: 'bold', mb: 3, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isLastRound ? 'Finals' : `Round ${roundNumber}`}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flexGrow: 1 }}>
              {roundMatches.map((match, idx) => {
                const isP1Winner = !!(match.winner && match.player1 && (match.winner === match.player1.uid || (typeof match.winner === 'object' && match.winner.uid === match.player1.uid)));
                const isP2Winner = !!(match.winner && match.player2 && (match.winner === match.player2.uid || (typeof match.winner === 'object' && match.winner.uid === match.player2.uid)));

                return (
                  <MatchContainer 
                    key={match.id} 
                    round={roundNumber} 
                    isFirstRound={isFirstRound} 
                    isLastRound={isLastRound}
                    className={idx % 2 === 0 ? 'match-even' : 'match-odd'}
                    sx={{
                        // Increase vertical spacing significantly per round to create tree effect
                        my: `${Math.pow(2, roundNumber - 1) * 10}px`
                    }}
                  >
                    <Box sx={getPlayerStyle(isP1Winner)}>
                      <Typography noWrap sx={{ fontSize: '0.85rem' }}>
                        {match.player1?.displayName || 'TBD'}
                      </Typography>
                    </Box>
                    <Box sx={{ height: '1px', bgcolor: 'rgba(255, 111, 0, 0.3)', my: 1 }} />
                    <Box sx={getPlayerStyle(isP2Winner)}>
                      <Typography noWrap sx={{ fontSize: '0.85rem' }}>
                        {match.player2?.displayName || 'TBD'}
                      </Typography>
                    </Box>
                  </MatchContainer>
                );
              })}
            </Box>
          </RoundContainer>
        );
      })}
    </BracketContainer>
  );
};

export default TournamentBracket;