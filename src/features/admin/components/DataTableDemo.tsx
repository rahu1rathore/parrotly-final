import React from 'react';
import { Box } from '@mui/material';
import DataTableExample from '../../../components/common/DataTableExample';

const DataTableDemo: React.FC = () => {
  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'auto' }}>
      <DataTableExample />
    </Box>
  );
};

export default DataTableDemo;
