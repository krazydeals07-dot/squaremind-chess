import React from 'react';
import StaticPageLayout from '../components/StaticPageLayout';
import { Typography, Link, Box } from '@mui/material';

const Privacy: React.FC = () => {
  return (
    <StaticPageLayout title="Privacy Policy">
      <Typography variant="body2" color="text.secondary" paragraph>
        Effective Date: {new Date().toLocaleDateString()}
      </Typography>

      <Typography variant="h6" component="h2">1. Information We Collect</Typography>
      <Typography variant="body1" paragraph>
        We collect your name, email, phone number, game statistics, and tournament payment details for registration, gameplay, and prize delivery.
      </Typography>

      <Typography variant="h6" component="h2">2. How We Use Your Information</Typography>
      <Box component="ul" sx={{ pl: 2.5, my: 1, paddingLeft: '20px' }}>
        <Typography component="li" sx={{ mb: 0.5 }}>Tournament organization and management</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>App improvement and support</Typography>
        <Typography component="li">Reward distribution (physical or digital gifts only)</Typography>
      </Box>

      <Typography variant="h6" component="h2">3. Data Protection</Typography>
      <Typography variant="body1" paragraph>
        We use SSL encryption, secure servers, and strict access control to protect your data.
      </Typography>

      <Typography variant="h6" component="h2">4. Data Sharing</Typography>
      <Typography variant="body1" paragraph>
        We only share limited information with payment processors, prize vendors, or authorities when legally required. We never sell or rent user data.
      </Typography>

      <Typography variant="h6" component="h2">5. Your Rights</Typography>
      <Typography variant="body1" paragraph>
        You can access, update, or delete your personal information by contacting us at <Link href="mailto:krazydeals07@gmail.com">krazydeals07@gmail.com</Link>.
      </Typography>

      <Typography variant="h6" component="h2">6. No Cash Rewards</Typography>
      <Typography variant="body1" paragraph>
        SquareMind does not offer any cash-based prizes. All rewards are non-monetary physical gifts or digital gift cards.
      </Typography>

      <Typography variant="h6" component="h2">7. Policy Updates</Typography>
      <Typography variant="body1" paragraph>
        We may update this policy from time to time. Updated versions will be available within the app and on our website.
      </Typography>
    </StaticPageLayout>
  );
};

export default Privacy;