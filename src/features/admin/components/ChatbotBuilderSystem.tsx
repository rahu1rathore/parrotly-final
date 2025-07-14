import { Box, Typography, Container, Card, CardContent } from "@mui/material";

export default function ChatbotBuilderSystem() {
  console.log("ChatbotBuilderSystem component is rendering");

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h3" gutterBottom color="primary">
            🤖 Chatbot Builder System
          </Typography>
          <Typography variant="h5" gutterBottom>
            This component is working!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            If you can see this message, the routing and component are working
            correctly.
          </Typography>
          <Box sx={{ mt: 3, p: 2, bgcolor: "success.light", borderRadius: 1 }}>
            <Typography variant="body2" color="success.dark">
              ✅ Component successfully loaded at /admin/chatbot-builder
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
