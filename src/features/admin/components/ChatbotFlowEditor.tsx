import React, { useState, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Tooltip,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PlayArrow as TestIcon,
  Settings as SettingsIcon,
  ViewModule as LayoutIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
  TextFields as TextIcon,
  SmartButton as ButtonIcon,
  List as ListIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  ShoppingCart as ProductIcon,
  Api as ApiIcon,
  CallSplit as ConditionIcon,
  Stop as EndIcon,
  Close as CloseIcon,
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
  EdgeChange,
  NodeChange,
  ReactFlowProvider,
  Panel,
  useReactFlow,
  getLayoutedElements,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { ChatbotFlow, ChatbotFlowNode, ChatbotFlowEdge } from "../types";

// Custom Node Components
const CustomTextNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 200, border: "2px solid #4f46e5" }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <TextIcon sx={{ mr: 1, color: "#4f46e5" }} />
        <Typography variant="caption" color="primary">
          Text Message
        </Typography>
      </Box>
      {data.header && (
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
          {data.header}
        </Typography>
      )}
      <Typography variant="body2" sx={{ mb: 1 }}>
        {data.body || "Enter message text..."}
      </Typography>
      {data.footer && (
        <Typography variant="caption" color="text.secondary">
          {data.footer}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const CustomButtonNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 220, border: "2px solid #16a34a" }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <ButtonIcon sx={{ mr: 1, color: "#16a34a" }} />
        <Typography variant="caption" color="success.main">
          Button Menu
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {data.body || "Enter menu text..."}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {data.buttons
          ?.slice(0, 3)
          .map((btn: any, idx: number) => (
            <Chip key={idx} label={btn.text} size="small" variant="outlined" />
          )) || <Chip label="Add buttons..." size="small" variant="outlined" />}
        {data.buttons?.length > 3 && (
          <Typography variant="caption">
            +{data.buttons.length - 3} more
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const CustomListNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 220, border: "2px solid #dc2626" }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <ListIcon sx={{ mr: 1, color: "#dc2626" }} />
        <Typography variant="caption" color="error.main">
          List Menu
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {data.body || "Enter list title..."}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {data.list_items?.slice(0, 2).map((item: any, idx: number) => (
          <Box
            key={idx}
            sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 0.5 }}
          >
            <Typography variant="caption" fontWeight="bold">
              {item.title}
            </Typography>
            {item.description && (
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                {item.description}
              </Typography>
            )}
          </Box>
        )) || <Typography variant="caption">Add list items...</Typography>}
        {data.list_items?.length > 2 && (
          <Typography variant="caption">
            +{data.list_items.length - 2} more
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const CustomMediaNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 200, border: "2px solid #7c3aed" }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {data.type === "image" && (
          <ImageIcon sx={{ mr: 1, color: "#7c3aed" }} />
        )}
        {data.type === "audio" && (
          <AudioIcon sx={{ mr: 1, color: "#7c3aed" }} />
        )}
        {data.type === "video" && (
          <VideoIcon sx={{ mr: 1, color: "#7c3aed" }} />
        )}
        <Typography variant="caption" color="secondary.main">
          {data.type === "image"
            ? "Image"
            : data.type === "audio"
              ? "Audio"
              : "Video"}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {data.body || "Enter media caption..."}
      </Typography>
      <Box
        sx={{
          height: 60,
          backgroundColor: "grey.100",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {data.media_url ? "Media attached" : "No media"}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const CustomApiNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 200, border: "2px solid #ea580c" }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <ApiIcon sx={{ mr: 1, color: "#ea580c" }} />
        <Typography variant="caption" color="warning.main">
          API Call
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {data.body || "Processing..."}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {data.api_config?.method || "GET"}{" "}
        {data.api_config?.url || "/api/endpoint"}
      </Typography>
    </CardContent>
  </Card>
);

const CustomEndNode = ({ data }: { data: any }) => (
  <Card sx={{ width: 150, border: "2px solid #64748b" }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <EndIcon sx={{ mr: 1, color: "#64748b" }} />
        <Typography variant="caption" color="text.secondary">
          End Flow
        </Typography>
      </Box>
      <Typography variant="body2">
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
  api_trigger: CustomApiNode,
  end: CustomEndNode,
};

interface ChatbotFlowEditorProps {
  flow: ChatbotFlow;
  onSave: (nodes: ChatbotFlowNode[], edges: ChatbotFlowEdge[]) => void;
  onPublish: () => void;
  onBack: () => void;
}

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
  {
    type: "api_trigger",
    label: "API Call",
    icon: <ApiIcon />,
    color: "#ea580c",
  },
  {
    type: "condition",
    label: "Condition",
    icon: <ConditionIcon />,
    color: "#ca8a04",
  },
  { type: "end", label: "End Flow", icon: <EndIcon />, color: "#64748b" },
];

function ChatbotFlowEditorContent({
  flow,
  onSave,
  onPublish,
  onBack,
}: ChatbotFlowEditorProps) {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodePropertiesOpen, setNodePropertiesOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved",
  );

  const dragRef = useRef<HTMLDivElement>(null);
  const [draggedType, setDraggedType] = useState<string | null>(null);

  // Initialize flow with existing nodes/edges
  React.useEffect(() => {
    if (flow.nodes && flow.edges) {
      const flowNodes = flow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node,
      }));
      const flowEdges = flow.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: edge.type || "default",
      }));
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [flow, setNodes, setEdges]);

  const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[]) => {
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

    return { nodes: layoutedNodes, edges };
  }, []);

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
          id: `${type}-${Date.now()}`,
          type,
          position,
          body: `New ${type} node`,
          header: type === "text" ? "Header" : undefined,
          footer: type === "text" ? "Footer" : undefined,
          buttons:
            type === "button"
              ? [{ id: "btn-1", text: "Option 1", action: "" }]
              : undefined,
          list_items:
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
      setSaveStatus("unsaved");
    },
    [reactFlowInstance, setNodes],
  );

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    setDraggedType(nodeType);
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodePropertiesOpen(true);
  }, []);

  const onDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id,
        ),
      );
      setSelectedNode(null);
      setNodePropertiesOpen(false);
      setSaveStatus("unsaved");
    }
  }, [selectedNode, setNodes, setEdges]);

  const autoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setSaveStatus("unsaved");
  }, [nodes, edges, getLayoutedElements, setNodes, setEdges]);

  const handleSave = useCallback(() => {
    setSaveStatus("saving");
    const flowNodes: ChatbotFlowNode[] = nodes.map((node) => ({
      ...node.data,
      position: node.position,
    }));
    const flowEdges: ChatbotFlowEdge[] = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: edge.type,
    }));
    onSave(flowNodes, flowEdges);
    setTimeout(() => setSaveStatus("saved"), 1000);
  }, [nodes, edges, onSave]);

  const updateNodeData = (nodeId: string, updates: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...updates } }
          : node,
      ),
    );
    setSaveStatus("unsaved");
  };

  const speedDialActions = [
    { icon: <SaveIcon />, name: "Save", onClick: handleSave },
    { icon: <PublishIcon />, name: "Publish", onClick: onPublish },
    {
      icon: <TestIcon />,
      name: "Test Flow",
      onClick: () => setTestDialogOpen(true),
    },
    { icon: <LayoutIcon />, name: "Auto Layout", onClick: autoLayout },
  ];

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
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={
                saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "saving"
                    ? "Saving..."
                    : "Unsaved"
              }
              color={
                saveStatus === "saved"
                  ? "success"
                  : saveStatus === "saving"
                    ? "warning"
                    : "error"
              }
              size="small"
            />
            <Button
              onClick={() => setDrawerOpen(true)}
              variant="outlined"
              startIcon={<AddIcon />}
            >
              Add Node
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={<SaveIcon />}
            >
              Save
            </Button>
            <Button
              onClick={onPublish}
              variant="contained"
              color="success"
              startIcon={<PublishIcon />}
            >
              Publish
            </Button>
            <Button onClick={onBack} variant="outlined">
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
            <Alert severity="info" sx={{ mb: 1 }}>
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
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.onClick}
            />
          ))}
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
              {selectedNode.data.type === "button" && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Buttons
                  </Typography>
                  {selectedNode.data.buttons?.map((btn: any, idx: number) => (
                    <Box key={idx} sx={{ display: "flex", gap: 1, mb: 1 }}>
                      <TextField
                        label="Button text"
                        value={btn.text}
                        onChange={(e) => {
                          const newButtons = [
                            ...(selectedNode.data.buttons || []),
                          ];
                          newButtons[idx] = { ...btn, text: e.target.value };
                          updateNodeData(selectedNode.id, {
                            buttons: newButtons,
                          });
                        }}
                        size="small"
                        sx={{ flexGrow: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newButtons = selectedNode.data.buttons?.filter(
                            (_: any, i: number) => i !== idx,
                          );
                          updateNodeData(selectedNode.id, {
                            buttons: newButtons,
                          });
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newButtons = [
                        ...(selectedNode.data.buttons || []),
                        {
                          id: `btn-${Date.now()}`,
                          text: "New Button",
                          action: "",
                        },
                      ];
                      updateNodeData(selectedNode.id, { buttons: newButtons });
                    }}
                  >
                    Add Button
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onDeleteNode}
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Node
          </Button>
          <Button onClick={() => setNodePropertiesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Test Dialog */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Test Chatbot Flow</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Flow testing functionality would be implemented here. This would
            allow you to simulate conversations and test your flow logic.
          </Alert>
          <Typography variant="body2">
            Features to include: • Step-through testing • Variable simulation •
            API response mocking • Conversation preview
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function ChatbotFlowEditor(props: ChatbotFlowEditorProps) {
  return (
    <ReactFlowProvider>
      <ChatbotFlowEditorContent {...props} />
    </ReactFlowProvider>
  );
}
