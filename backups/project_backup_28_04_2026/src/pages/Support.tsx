import React from 'react';
import StaticPageLayout from '../components/StaticPageLayout';
import { Typography, Box, Link } from '@mui/material';
import { Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';

const Support: React.FC = () => {
  return (
    <StaticPageLayout title="Contact & Support">
      <Typography variant="body1" paragraph>
        We are here to help! If you have any questions, issues, or feedback, please don&apos;t hesitate to get in touch with us using the contact details below.
      </Typography>

      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" component="h3">Email</Typography>
            <Link href="mailto:krazydeals07@gmail.com" underline="hover">
              krazydeals07@gmail.com
            </Link>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" component="h3">Phone</Typography>
            <Link href="tel:+919689037000" underline="hover">
              +91-968 903 7000
            </Link>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" component="h3">Address</Typography>
            <Typography variant="body1">
              Warora, Dist- Chandrapur, Maharashtra, India 442907
            </Typography>
          </Box>
        </Box>
      </Box>
    </StaticPageLayout>
  );
};

export default Support;
