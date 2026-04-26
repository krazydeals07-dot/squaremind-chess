
import { Box, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface ChessIconProps {
  boxSx?: SxProps<Theme>;
  typographySx?: SxProps<Theme>;
  noCircle?: boolean;
  iconColor?: string;
}

const ChessIcon = ({ boxSx, typographySx, noCircle = false, iconColor = 'black' }: ChessIconProps) => {
  const icon = (
    <Typography sx={{ 
        fontSize: { xs: '2.5rem', md: '4.5rem' }, 
        color: iconColor, 
        lineHeight: 1, 
        ...typographySx 
    }}>
        ♞
    </Typography>
  );

  if (noCircle) {
    return icon;
  }

  return (
    <Box sx={{
        width: { xs: 50, md: 70 },
        height: { xs: 50, md: 70 },
        borderRadius: '50%',
        backgroundColor: '#FFA500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        mb: { xs: 1, md: 2 },
        ...boxSx
    }}>
        {icon}
    </Box>
  );
};

export default ChessIcon;
