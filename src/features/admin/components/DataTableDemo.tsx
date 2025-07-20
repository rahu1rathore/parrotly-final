import React from 'react';
import { Box } from '@mui/material';
import DataTableExample from '../../../components/common/DataTableExample';

const DataTableDemo: React.FC = () => {
  return (
    <Box sx={{ width: '100%', height: '100vh', p: 0, m: 0, bgcolor: 'grey.50', overflow: 'hidden' }}>
      {/* Demo Container */}
      <Box sx={{ height: '100vh', overflow: 'auto' }}>
        <DataTableExample />
      </Box>
    </Box>
  );
};

export default DataTableDemo;
