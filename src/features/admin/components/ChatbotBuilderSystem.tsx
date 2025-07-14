import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Toolbar,
  AppBar,
} from "@mui/material";
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Assessment as AnalyticsIcon,
  PlayArrow as TestIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Publish as PublishIcon,
  Settings as SettingsIcon,
  ViewModule as LayoutIcon,
  TextFields as TextIcon,
  SmartButton as ButtonIcon,
  List as ListIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  ShoppingCart as ProductIcon,
  Api as ApiIcon,
  Stop as EndIcon,
  Close as CloseIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
} from "@mui/icons-material";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  Panel,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

// Types
interface ChatbotFlow {
  id: string;
  name: string;
  description?: string;
  triggerKeywords: string[];
  tags: string[];
  category: string;
  accessPermissions: "public" | "private" | "role-based";
  allowedRoles?: string[];
  nodes: Node[];
  edges: Edge[];
  isActive: boolean;
  version: number;
  createdDate: string;
  updatedDate: string;
}

interface FlowFormData {
  name: string;
  description: string;
  triggerKeywords: string[];
  tags: string[];
  category: string;
  accessPermissions: "public" | "private" | "role-based";
  allowedRoles: string[];
}

// Custom Node Components
const CustomTextNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 200, border: "2px solid #4f46e5", borderRadius: 2 }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <TextIcon sx={{ mr: 1, color: "#4f46e5", fontSize: 16 }} />
        <Typography variant="caption" color="primary" fontWeight="bold">
          Text Message
        </Typography>
      </Box>
      {data.header && (
        <Typography
          variant="body2"
          fontWeight="bold"
          sx={{ mb: 0.5, fontSize: "0.75rem" }}
        >
          {data.header}
        </Typography>
      )}
      <Typography variant="body2" sx={{ mb: 1, fontSize: "0.75rem" }}>
        {data.body || "Enter message text..."}
      </Typography>
      {data.footer && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.7rem" }}
        >
          {data.footer}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const CustomButtonNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 220, border: "2px solid #16a34a", borderRadius: 2 }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <ButtonIcon sx={{ mr: 1, color: "#16a34a", fontSize: 16 }} />
        <Typography variant="caption" color="success.main" fontWeight="bold">
          Button Menu
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 1, fontSize: "0.75rem" }}>
        {data.body || "Enter menu text..."}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {data.buttons
          ?.slice(0, 3)
          .map((btn: any, idx: number) => (
            <Chip
              key={idx}
              label={btn.text}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.65rem", height: 20 }}
            />
          )) || (
          <Chip
            label="Add buttons..."
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.65rem", height: 20 }}
          />
        )}
        {data.buttons?.length > 3 && (
          <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
            +{data.buttons.length - 3} more
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const CustomListNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 220, border: "2px solid #dc2626", borderRadius: 2 }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <ListIcon sx={{ mr: 1, color: "#dc2626", fontSize: 16 }} />
        <Typography variant="caption" color="error.main" fontWeight="bold">
          List Menu
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 1, fontSize: "0.75rem" }}>
        {data.body || "Enter list title..."}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {data.listItems?.slice(0, 2).map((item: any, idx: number) => (
          <Box
            key={idx}
            sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 0.5 }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{ fontSize: "0.65rem" }}
            >
              {item.title}
            </Typography>
            {item.description && (
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ fontSize: "0.6rem" }}
              >
                {item.description}
              </Typography>
            )}
          </Box>
        )) || (
          <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
            Add list items...
          </Typography>
        )}
        {data.listItems?.length > 2 && (
          <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
            +{data.listItems.length - 2} more
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const CustomMediaNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 200, border: "2px solid #7c3aed", borderRadius: 2 }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {data.type === "image" && (
          <ImageIcon sx={{ mr: 1, color: "#7c3aed", fontSize: 16 }} />
        )}
        {data.type === "audio" && (
          <AudioIcon sx={{ mr: 1, color: "#7c3aed", fontSize: 16 }} />
        )}
        {data.type === "video" && (
          <VideoIcon sx={{ mr: 1, color: "#7c3aed", fontSize: 16 }} />
        )}
        <Typography
          variant="caption"
          color="secondary.main"
          fontWeight="bold"
          sx={{ fontSize: "0.7rem" }}
        >
          {data.type === "image"
            ? "Image"
            : data.type === "audio"
              ? "Audio"
              : "Video"}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 1, fontSize: "0.75rem" }}>
        {data.body || "Enter media caption..."}
      </Typography>
      <Box
        sx={{
          height: 40,
          backgroundColor: "grey.100",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.65rem" }}
        >
          {data.mediaUrl ? "Media attached" : "No media"}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const CustomApiNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 200, border: "2px solid #ea580c", borderRadius: 2 }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <ApiIcon sx={{ mr: 1, color: "#ea580c", fontSize: 16 }} />
        <Typography
          variant="caption"
          color="warning.main"
          fontWeight="bold"
          sx={{ fontSize: "0.7rem" }}
        >
          API Call
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 1, fontSize: "0.75rem" }}>
        {data.body || "Processing..."}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: "0.65rem" }}
      >
        {data.apiConfig?.method || "GET"}{" "}
        {data.apiConfig?.url || "/api/endpoint"}
      </Typography>
    </CardContent>
  </Card>
);

const CustomEndNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 150, border: "2px solid #64748b", borderRadius: 2 }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <EndIcon sx={{ mr: 1, color: "#64748b", fontSize: 16 }} />
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight="bold"
          sx={{ fontSize: "0.7rem" }}
        >
          End Flow
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
        {data.body || "Conversation ends"}
      </Typography>
    </CardContent>
  </Card>
);

const nodeTypes = {
  text: CustomTextNode,
  button: CustomButtonNode,
  list: CustomListNode,
  image: CustomMediaNode,
  audio: CustomMediaNode,
  video: CustomMediaNode,
  product: CustomMediaNode,
  api: CustomApiNode,
  end: CustomEndNode,
};

// Node Templates
const nodeTemplates = [
  { type: "text", label: "Text Message", icon: <TextIcon />, color: "#4f46e5" },
  {
    type: "button",
    label: "Button Menu",
    icon: <ButtonIcon />,
    color: "#16a34a",
  },
  { type: "list", label: "List Menu", icon: <ListIcon />, color: "#dc2626" },
  { type: "image", label: "Image", icon: <ImageIcon />, color: "#7c3aed" },
  { type: "audio", label: "Audio", icon: <AudioIcon />, color: "#7c3aed" },
  { type: "video", label: "Video", icon: <VideoIcon />, color: "#7c3aed" },
  {
    type: "product",
    label: "Product",
    icon: <ProductIcon />,
    color: "#0891b2",
  },
  { type: "api", label: "API Call", icon: <ApiIcon />, color: "#ea580c" },
  { type: "end", label: "End Flow", icon: <EndIcon />, color: "#64748b" },
];

// Mock data
const mockFlows: ChatbotFlow[] = [
  {
    id: "1",
    name: "Welcome Flow",
    description: "Initial greeting and onboarding for new users",
    triggerKeywords: ["hello", "hi", "start"],
    tags: ["welcome", "onboarding"],
    category: "general",
    accessPermissions: "public",
    nodes: [],
    edges: [],
    isActive: true,
    version: 1,
    createdDate: "2024-02-01",
    updatedDate: "2024-02-01",
  },
  {
    id: "2",
    name: "Support Flow",
    description: "Customer support and FAQ handling",
    triggerKeywords: ["help", "support", "problem"],
    tags: ["support", "help"],
    category: "support",
    accessPermissions: "public",
    nodes: [],
    edges: [],
    isActive: false,
    version: 1,
    createdDate: "2024-01-28",
    updatedDate: "2024-01-28",
  },
];

// Flow Editor Component
function FlowEditor({
  flow,
  onSave,
  onBack,
}: {
  flow: ChatbotFlow;
  onSave: (nodes: Node[], edges: Edge[]) => void;
  onBack: () => void;
}) {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState(flow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodePropertiesOpen, setNodePropertiesOpen] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          type,
          body: `New ${type} node`,
          header: type === "text" ? "Header" : undefined,
          footer: type === "text" ? "Footer" : undefined,
          buttons:
            type === "button"
              ? [{ id: "btn-1", text: "Option 1", action: "" }]
              : undefined,
          listItems:
            type === "list"
              ? [
                  {
                    id: "item-1",
                    title: "Item 1",
                    description: "Description",
                    action: "",
                  },
                ]
              : undefined,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodePropertiesOpen(true);
  }, []);

  const autoLayout = useCallback(() => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: "TB" });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 220, height: 100 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 110,
          y: nodeWithPosition.y - 50,
        },
      };
    });

    setNodes(layoutedNodes);
  }, [nodes, edges, setNodes]);

  const handleSave = () => {
    onSave(nodes, edges);
  };

  const updateNodeData = (nodeId: string, updates: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node,
      ),
    );
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Toolbar */}
      <AppBar
        position="static"
        elevation={1}
        sx={{ backgroundColor: "background.paper", color: "text.primary" }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {flow.name} - Flow Editor
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => setDrawerOpen(true)}
              variant="outlined"
              startIcon={<AddIcon />}
              size="small"
            >
              Add Node
            </Button>
            <Button
              onClick={autoLayout}
              variant="outlined"
              startIcon={<LayoutIcon />}
              size="small"
            >
              Auto Layout
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={<SaveIcon />}
              size="small"
            >
              Save
            </Button>
            <Button onClick={onBack} variant="outlined" size="small">
              Back
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Editor Area */}
      <Box sx={{ flexGrow: 1, position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-left">
            <Alert severity="info" sx={{ mb: 1, maxWidth: 300 }}>
              Drag nodes from the sidebar to build your conversation flow
            </Alert>
          </Panel>
        </ReactFlow>

        {/* Speed Dial for quick actions */}
        <SpeedDial
          ariaLabel="Flow actions"
          sx={{ position: "absolute", bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<SaveIcon />}
            tooltipTitle="Save"
            onClick={handleSave}
          />
          <SpeedDialAction
            icon={<LayoutIcon />}
            tooltipTitle="Auto Layout"
            onClick={autoLayout}
          />
          <SpeedDialAction
            icon={<TestIcon />}
            tooltipTitle="Test Flow"
            onClick={() => alert("Test functionality coming soon!")}
          />
        </SpeedDial>
      </Box>

      {/* Node Palette Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Node Types
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Drag nodes to the canvas to build your flow
          </Typography>
        </Box>
        <Divider />
        <List>
          {nodeTemplates.map((template) => (
            <ListItem
              key={template.type}
              sx={{
                cursor: "grab",
                "&:hover": { backgroundColor: "action.hover" },
                border: 1,
                borderColor: "transparent",
                m: 1,
                borderRadius: 1,
              }}
              draggable
              onDragStart={(e) => onDragStart(e, template.type)}
            >
              <ListItemIcon sx={{ color: template.color }}>
                {template.icon}
              </ListItemIcon>
              <ListItemText
                primary={template.label}
                secondary={`Add ${template.label.toLowerCase()} to flow`}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Node Properties Panel */}
      <Dialog
        open={nodePropertiesOpen}
        onClose={() => setNodePropertiesOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Node Properties
            <IconButton onClick={() => setNodePropertiesOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedNode && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Node Body"
                multiline
                rows={3}
                value={selectedNode.data.body || ""}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { body: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              {selectedNode.data.type === "text" && (
                <>
                  <TextField
                    fullWidth
                    label="Header (optional)"
                    value={selectedNode.data.header || ""}
                    onChange={(e) =>
                      updateNodeData(selectedNode.id, {
                        header: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Footer (optional)"
                    value={selectedNode.data.footer || ""}
                    onChange={(e) =>
                      updateNodeData(selectedNode.id, {
                        footer: e.target.value,
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodePropertiesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Main Component
export default function ChatbotBuilderSystem() {
  const [activeTab, setActiveTab] = useState(0);
  const [flows, setFlows] = useState<ChatbotFlow[]>(mockFlows);
  const [createFlowOpen, setCreateFlowOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<ChatbotFlow | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "edit">("list");
  const [newFlow, setNewFlow] = useState<FlowFormData>({
    name: "",
    description: "",
    triggerKeywords: [],
    tags: [],
    category: "",
    accessPermissions: "public",
    allowedRoles: [],
  });

  const handleCreateFlow = () => {
    const flow: ChatbotFlow = {
      id: Date.now().toString(),
      ...newFlow,
      nodes: [],
      edges: [],
      isActive: false,
      version: 1,
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
    };
    setFlows([...flows, flow]);
    setCreateFlowOpen(false);
    setNewFlow({
      name: "",
      description: "",
      triggerKeywords: [],
      tags: [],
      category: "",
      accessPermissions: "public",
      allowedRoles: [],
    });
  };

  const handleEditFlow = (flow: ChatbotFlow) => {
    setSelectedFlow(flow);
    setViewMode("edit");
  };

  const handleSaveFlow = (nodes: Node[], edges: Edge[]) => {
    if (selectedFlow) {
      const updatedFlow = {
        ...selectedFlow,
        nodes,
        edges,
        updatedDate: new Date().toISOString().split("T")[0],
      };
      setFlows(flows.map((f) => (f.id === selectedFlow.id ? updatedFlow : f)));
      setSelectedFlow(updatedFlow);
    }
  };

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !newFlow.triggerKeywords.includes(keyword.trim())) {
      setNewFlow((prev) => ({
        ...prev,
        triggerKeywords: [
          ...prev.triggerKeywords,
          keyword.trim().toLowerCase(),
        ],
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setNewFlow((prev) => ({
      ...prev,
      triggerKeywords: prev.triggerKeywords.filter((k) => k !== keyword),
    }));
  };

  if (viewMode === "edit" && selectedFlow) {
    return (
      <ReactFlowProvider>
        <FlowEditor
          flow={selectedFlow}
          onSave={handleSaveFlow}
          onBack={() => setViewMode("list")}
        />
      </ReactFlowProvider>
    );
  }

  const renderFlowManagement = () => (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Conversation Flows</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateFlowOpen(true)}
        >
          Create New Flow
        </Button>
      </Box>

      <Grid container spacing={3}>
        {flows.map((flow) => (
          <Grid item xs={12} sm={6} md={4} key={flow.id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">{flow.name}</Typography>
                  <Chip
                    label={flow.isActive ? "Active" : "Draft"}
                    color={flow.isActive ? "success" : "default"}
                    size="small"
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {flow.description}
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 0.5, mb: 2, flexWrap: "wrap" }}
                >
                  {flow.triggerKeywords.slice(0, 3).map((keyword) => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {flow.triggerKeywords.length > 3 && (
                    <Chip
                      label={`+${flow.triggerKeywords.length - 3}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <IconButton size="small" onClick={() => handleEditFlow(flow)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small">
                    <TestIcon />
                  </IconButton>
                  <IconButton size="small">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        🤖 Chatbot Builder
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Build sophisticated conversational experiences with our visual flow
        editor
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab
            label="Flow Management"
            icon={<ChatIcon />}
            iconPosition="start"
          />
          <Tab
            label="Analytics"
            icon={<AnalyticsIcon />}
            iconPosition="start"
          />
          <Tab label="Testing" icon={<TestIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {activeTab === 0 && renderFlowManagement()}
      {activeTab === 1 && (
        <Alert severity="info">Analytics dashboard coming soon!</Alert>
      )}
      {activeTab === 2 && (
        <Alert severity="info">Testing interface coming soon!</Alert>
      )}

      {/* Create Flow Dialog */}
      <Dialog
        open={createFlowOpen}
        onClose={() => setCreateFlowOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Chatbot Flow</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Flow Name"
              value={newFlow.name}
              onChange={(e) => setNewFlow({ ...newFlow, name: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={newFlow.description}
              onChange={(e) =>
                setNewFlow({ ...newFlow, description: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newFlow.category}
                label="Category"
                onChange={(e) =>
                  setNewFlow({ ...newFlow, category: e.target.value })
                }
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="support">Support</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Access Permissions</InputLabel>
              <Select
                value={newFlow.accessPermissions}
                label="Access Permissions"
                onChange={(e) =>
                  setNewFlow({
                    ...newFlow,
                    accessPermissions: e.target.value as any,
                  })
                }
              >
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="role-based">Role-based</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFlowOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateFlow}
            variant="contained"
            disabled={!newFlow.name}
          >
            Create Flow
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
