export default function ChatbotBuilderTest() {
  console.log("ChatbotBuilderTest component is rendering!");
  console.log("Current URL:", window.location.href);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "red",
        color: "white",
        fontSize: "24px",
        minHeight: "200px",
        border: "5px solid yellow",
        margin: "20px",
      }}
    >
      <h1>🔴 CHATBOT BUILDER TEST COMPONENT 🔴</h1>
      <p>If you see this, the routing is working!</p>
      <p>URL: {window.location.pathname}</p>
    </div>
  );
}
