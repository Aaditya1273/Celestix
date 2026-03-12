import { Table, Box, Text } from '@chakra-ui/react';

const CodeCell = ({ content = '' }) => {
  return (
    <Box
      fontFamily='monospace'
      py={1} px={2}
      borderRadius='5px'
      width='fit-content'
      fontWeight={500}
      color='#e9e9e9'
      backgroundColor='rgba(255, 107, 0, 0.1)'
    >
      {content}
    </Box>
  )
}

// PropTable component that doesn't render anything
const PropTable = ({ data }) => {
  // Return null to render nothing
  return null;
};

export default PropTable;
