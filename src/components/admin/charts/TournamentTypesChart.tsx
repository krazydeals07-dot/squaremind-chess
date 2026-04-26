import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const TournamentTypesChart = ({ data }) => (
    <Paper elevation={3} sx={{ p: 2, borderRadius: '12px', height: 300 }}>
        <Typography variant="h6" gutterBottom>Tournament Types</Typography>
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </Paper>
);

TournamentTypesChart.propTypes = {
    data: PropTypes.array.isRequired,
};

export default TournamentTypesChart;
