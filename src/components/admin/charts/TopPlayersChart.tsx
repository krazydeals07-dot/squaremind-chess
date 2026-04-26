import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const TopPlayersChart = ({ data }) => (
    <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', height: 400 }}>
        <Typography variant="h6" gutterBottom>Top Players by Elo Rating</Typography>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="rating" fill="#82ca9d" />
            </BarChart>
        </ResponsiveContainer>
    </Paper>
);

TopPlayersChart.propTypes = {
    data: PropTypes.array.isRequired,
};

export default TopPlayersChart;
