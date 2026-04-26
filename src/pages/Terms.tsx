import React from 'react';
import StaticPageLayout from '../components/StaticPageLayout';
import { Typography, Link, Box } from '@mui/material';

const Terms: React.FC = () => {
  return (
    <StaticPageLayout title="Terms and Conditions">
      <Typography variant="body2" color="text.secondary" paragraph>
        Last Updated: {new Date().toLocaleDateString()}
      </Typography>

      <Typography variant="h6" component="h2">1. Acceptance of Terms</Typography>
      <Typography variant="body1" paragraph>
        By accessing or using the SquareMind application (&quot;App&quot;), you agree to be bound by these Terms and Conditions (&quot;Terms&quot;) and all applicable laws and regulations of India. If you do not agree with any part of these Terms, you are prohibited from using or accessing this App.
      </Typography>

      <Typography variant="h6" component="h2">2. Account Registration</Typography>
      <Box component="ul" sx={{ pl: 2.5, my: 1, paddingLeft: '20px' }}>
        <Typography component="li" sx={{ mb: 0.5 }}>You must be 18 years of age or older to create an account.</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>You agree to provide accurate, current, and complete information during the registration process.</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>Each user is permitted to have only one account. Creating multiple accounts is strictly prohibited.</Typography>
        <Typography component="li">Providing misleading or false information may result in the suspension or termination of your account.</Typography>
      </Box>

      <Typography variant="h6" component="h2">3. Tournament Rules</Typography>
      <Typography variant="h6" component="h3" sx={{fontSize: '1.1rem', marginTop: '1rem'}}>Fees &amp; Participation</Typography>
      <Box component="ul" sx={{ pl: 2.5, my: 1, paddingLeft: '20px' }}>
        <Typography component="li" sx={{ mb: 0.5 }}>All entry fees for tournaments are non-refundable and non-transferable.</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>SquareMind reserves the right to cancel any tournament if the minimum number of participants is not met. In such cases, entry fees may be refunded at our discretion.</Typography>
        <Typography component="li">Any form of misconduct, cheating, or unfair play will result in immediate disqualification from the tournament without a refund.</Typography>
      </Box>

      <Typography variant="h6" component="h3" sx={{fontSize: '1.1rem', marginTop: '1rem'}}>Prizes</Typography>
      <Box component="ul" sx={{ pl: 2.5, my: 1, paddingLeft: '20px' }}>
        <Typography component="li" sx={{ mb: 0.5 }}>SquareMind does not offer any cash-based prizes.</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>All rewards are provided in the form of physical goods (e.g., bicycle, T-shirt) or digital gift cards (e.g., Amazon vouchers).</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>Prizes are non-transferable and cannot be exchanged for cash.</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>Users are solely responsible for any and all applicable taxes on prizes received.</Typography>
        <Typography component="li">Prizes will be distributed to winners within 30 business days of the tournament&apos;s conclusion.</Typography>
      </Box>

      <Typography variant="h6" component="h2">4. Payment Terms</Typography>
      <Box component="ul" sx={{ pl: 2.5, my: 1, paddingLeft: '20px' }}>
        <Typography component="li" sx={{ mb: 0.5 }}>All fees and payments are processed in Indian Rupees (INR).</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>We use secure, authorized third-party payment gateways for all transactions. We do not store your credit card information.</Typography>
        <Typography component="li">Fees are non-refundable, except in cases of documented service failure on our part.</Typography>
      </Box>

      <Typography variant="h6" component="h2">5. User Conduct</Typography>
      <Typography variant="body1" paragraph>
        You agree not to engage in any of the following prohibited activities:
      </Typography>
      <Box component="ul" sx={{ pl: 2.5, my: 1, paddingLeft: '20px' }}>
        <Typography component="li" sx={{ mb: 0.5 }}>Engaging in threatening, abusive, harassing, defamatory, or immoral behavior.</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>Using bots, automation tools, or any form of cheating to gain an unfair advantage.</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>Disrupting or miscommunicating with competitors with malicious intent.</Typography>
        <Typography component="li">Infringing upon the intellectual property rights of SquareMind or any third party.</Typography>
      </Box>

      <Typography variant="h6" component="h2">6. Intellectual Property</Typography>
      <Typography variant="body1" paragraph>
        All content, graphics, designs, the SquareMind logo, and software are the exclusive intellectual property of Krazydeals Digital Services. Unauthorized copying, use, or reproduction is strictly prohibited.
      </Typography>

      <Typography variant="h6" component="h2">7. Limitation of Liability</Typography>
      <Typography variant="body1" paragraph>
        The App and its services are provided on an &quot;as-is&quot; and &quot;as-available&quot; basis without any warranties. SquareMind (Krazydeals Digital Services) shall not be liable for any indirect, incidental, special, or consequential damages, including technical issues or data loss. Delays in prize distribution do not constitute a basis for liability claims.
      </Typography>

      <Typography variant="h6" component="h2">8. Suspension &amp; Termination</Typography>
      <Typography variant="body1" paragraph>
        We reserve the right to suspend or permanently terminate your account without notice if you violate these Terms. Disqualified or terminated users will not be eligible for refunds or any pending rewards.
      </Typography>

      <Typography variant="h6" component="h2">9. Dispute Resolution</Typography>
      <Box component="ul" sx={{ pl: 2.5, my: 1, paddingLeft: '20px' }}>
        <Typography component="li" sx={{ mb: 0.5 }}>For any disputes, you must first contact us by sending a detailed complaint to <Link href="mailto:krazydeals07@gmail.com">krazydeals07@gmail.com</Link>.</Typography>
        <Typography component="li" sx={{ mb: 0.5 }}>Both parties agree to a 30-day coordination period to attempt to resolve the dispute amicably.</Typography>
        <Typography component="li">Any legal action or proceeding shall be brought exclusively in the courts located in <strong>Warora, Maharashtra, India</strong>.</Typography>
      </Box>

      <Typography variant="h6" component="h2">10. Governing Law</Typography>
      <Typography variant="body1" paragraph>
        These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
      </Typography>

      <Typography variant="h6" component="h2">11. Modification Rights</Typography>
      <Typography variant="body1" paragraph>
        SquareMind reserves the right to modify these Terms at any time. We will notify users of any changes at least 7 days before they take effect. Your continued use of the App after such changes constitutes your acceptance of the new Terms.
      </Typography>

      <Typography variant="h6" component="h2">12. Contact Information</Typography>
      <Typography variant="body1"><strong>Company Name:</strong> Krazydeals Digital Services</Typography>
      <Typography variant="body1"><strong>Email:</strong> <Link href="mailto:krazydeals07@gmail.com">krazydeals07@gmail.com</Link></Typography>
      <Typography variant="body1"><strong>Phone:</strong> +91-968 903 7000</Typography>
      <Typography variant="body1" paragraph>
        <strong>Address:</strong> Warora, Dist- Chandrapur, Maharashtra, India 442907
      </Typography>

      <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: '8px', mt: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" component="h2">🔹 Disclaimer</Typography>
        <Typography variant="body1" paragraph>
          SquareMind is a platform for skill-based chess tournaments. It is not a gambling, betting, or game of chance service. All rewards are determined by the player&apos;s skill and performance. Users are solely responsible for all applicable taxes on prizes. Your personal data is handled in accordance with our Privacy Policy.
        </Typography>
      </Box>
    </StaticPageLayout>
  );
};

export default Terms;
