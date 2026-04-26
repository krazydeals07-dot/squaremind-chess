import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const TournamentParticipationChart = ({ data }) => (
    <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', height: 400 }}>
        <Typography variant="h6" gutterBottom>Tournament Participation</Typography>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 95 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="participants" fill="#ffc658" />
            </BarChart>
        </ResponsiveContainer>
    </Paper>
);

TournamentParticipationChart.propTypes = {
    data: PropTypes.array.isRequired,
};

export default TournamentParticipationChart;
