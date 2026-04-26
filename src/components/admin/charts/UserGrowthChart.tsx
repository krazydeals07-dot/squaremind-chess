import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const UserGrowthChart = ({ data }) => (
    <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', height: 300 }}>
        <Typography variant="h6" gutterBottom>Daily User Growth</Typography>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </Paper>
);

UserGrowthChart.propTypes = {
    data: PropTypes.array.isRequired,
};

export default UserGrowthChart;
