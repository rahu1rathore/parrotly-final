import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import DataTableExample from '../../../components/common/DataTableExample';

const DataTableDemo: React.FC = () => {
  return (
    <Box sx={{ width: '100%', height: '100vh', p: 0, m: 0, bgcolor: 'grey.50' }}>
      {/* Header */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 0, 
          borderRadius: 0,
          borderBottom: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight={600} color="text.primary">
            🚀 DataTable Component Demo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            A fully responsive, feature-rich React table component built with Tailwind CSS
          </Typography>
        </Stack>
      </Paper>

      {/* Demo Container */}
      <Box sx={{ height: 'calc(100vh - 120px)', overflow: 'auto' }}>
        <DataTableExample />
      </Box>
    </Box>
  );
};

export default DataTableDemo;
