import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Divider,
  Stack,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Drawer,
  useTheme,
  useMediaQuery,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import {
  Search as SearchIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Circle as OnlineIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  VideocamOutlined as VideoIcon,
  CallOutlined as CallIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Chat, ChatUser, ChatMessage, ChatUserFormData } from "../types";
import {
  chatAPI,
  chatUserAPI,
  mockChats,
  mockChatUsers,
} from "../services/api";

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface InterveneAdminChatProps {
  onChatsChange?: () => void;
}

const InterveneAdminChat: React.FC<InterveneAdminChatProps> = ({
  onChatsChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Data state
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Profile editing state
  const [editingUser, setEditingUser] = useState<ChatUser | null>(null);
  const [profileFormData, setProfileFormData] = useState<ChatUserFormData>({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [profileErrors, setProfileErrors] = useState<Partial<ChatUserFormData>>(
    {},
  );

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadChats();
    loadChatUsers();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  // Focus on message input when chat is selected
  useEffect(() => {
    if (selectedChat && !isMobile) {
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 100);
    }
  }, [selectedChat, isMobile]);

  const loadChats = async () => {
    setLoading(true);
    try {
      // Sort chats by last message time (most recent first)
      const sortedChats = [...mockChats].sort(
        (a, b) =>
          new Date(b.last_message_time || "").getTime() -
          new Date(a.last_message_time || "").getTime(),
      );
      setChats(sortedChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatUsers = async () => {
    try {
      setChatUsers(mockChatUsers);
    } catch (error) {
      console.error("Failed to load chat users:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter chats based on search
  const filteredChats = chats.filter((chat) =>
    chat.user_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }

    // Mark messages as read
    if (chat.unread_count > 0) {
      const updatedChat = { ...chat, unread_count: 0 };
      setChats((prevChats) =>
        prevChats.map((c) => (c.id === chat.id ? updatedChat : c)),
      );
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      chat_id: selectedChat.id,
      sender_id: "admin",
      sender_type: "admin",
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: true,
      message_type: "text",
    };

    // Add message to selected chat
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, message],
      last_message: message.message,
      last_message_time: message.timestamp,
    };

    setSelectedChat(updatedChat);

    // Update chats list
    setChats((prevChats) => {
      const updated = prevChats.map((c) =>
        c.id === selectedChat.id ? updatedChat : c,
      );
      // Sort by last message time
      return updated.sort(
        (a, b) =>
          new Date(b.last_message_time || "").getTime() -
          new Date(a.last_message_time || "").getTime(),
      );
    });

    setNewMessage("");
    onChatsChange?.();

    // In real app, make API call
    // await chatAPI.sendMessage(selectedChat.id, newMessage);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleProfileClick = (user: ChatUser) => {
    setSelectedUser(user);
    setProfileDrawerOpen(true);
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    if (selectedUser) {
      setEditingUser(selectedUser);
      setProfileFormData({
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        avatar: selectedUser.avatar || "",
      });
      setProfileErrors({});
    }
  };

  const validateProfileForm = (): boolean => {
    const errors: Partial<ChatUserFormData> = {};

    if (!profileFormData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!profileFormData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileFormData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!profileFormData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm() || !editingUser) return;

    setLoading(true);
    try {
      const updatedUser = {
        ...editingUser,
        ...profileFormData,
        updated_at: new Date().toISOString(),
      };

      // Update chat users list
      setChatUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? updatedUser : user,
        ),
      );

      // Update selected user
      setSelectedUser(updatedUser);

      // Update chats with new user info
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.user_id === editingUser.id
            ? {
                ...chat,
                user_name: updatedUser.name,
                user_avatar: updatedUser.avatar,
              }
            : chat,
        ),
      );

      // Update selected chat if it's for this user
      if (selectedChat && selectedChat.user_id === editingUser.id) {
        setSelectedChat((prev) =>
          prev
            ? {
                ...prev,
                user_name: updatedUser.name,
                user_avatar: updatedUser.avatar,
              }
            : null,
        );
      }

      setEditingUser(null);
      // In real app, make API call
      // await chatUserAPI.update(editingUser.id, profileFormData);
    } catch (error) {
      console.error("Failed to update user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "#4ade80";
      case "away":
        return "#f59e0b";
      case "offline":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const messageTime = dayjs(timestamp);
    const now = dayjs();

    if (now.diff(messageTime, "day") === 0) {
      return messageTime.format("h:mm A");
    } else if (now.diff(messageTime, "day") === 1) {
      return "Yesterday";
    } else {
      return messageTime.format("MMM DD");
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    return `Last seen ${dayjs(lastSeen).fromNow()}`;
  };

  // Sidebar Component
  const ChatSidebar = () => (
    <Box
      sx={{
        width: isMobile ? "100%" : 320,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: isMobile ? "none" : "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Admin Chat
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "grey.50",
            },
          }}
        />
      </Box>

      {/* Chat List */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <List sx={{ p: 0 }}>
          {filteredChats.map((chat) => {
            const user = chatUsers.find((u) => u.id === chat.user_id);
            return (
              <ListItemButton
                key={chat.id}
                selected={selectedChat?.id === chat.id}
                onClick={() => handleChatSelect(chat)}
                sx={{
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&.Mui-selected": {
                    backgroundColor: "primary.50",
                    borderRight: "3px solid",
                    borderRightColor: "primary.main",
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <OnlineIcon
                        sx={{
                          width: 12,
                          height: 12,
                          color: getStatusColor(user?.status || "offline"),
                        }}
                      />
                    }
                  >
                    <Avatar
                      src={chat.user_avatar}
                      sx={{ width: 48, height: 48 }}
                    >
                      {chat.user_name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                                <ListItemText
                  primary={
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        component="span"
                        variant="subtitle1"
                        fontWeight={500}
                        noWrap
                      >
                        {chat.user_name}
                      </Typography>
                      {chat.unread_count > 0 && (
                        <Badge
                          badgeContent={chat.unread_count}
                          color="primary"
                          sx={{
                            "& .MuiBadge-badge": {
                              fontSize: "0.75rem",
                              height: 20,
                              minWidth: 20,
                            },
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box
                      component="span"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 180 }}
                      >
                        {chat.last_message}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatMessageTime(chat.last_message_time || "")}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  // Main Chat Area Component
  const ChatArea = () => {
    if (!selectedChat) {
      return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "grey.50",
          }}
        >
          <Card sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: "0 auto 16px",
                backgroundColor: "primary.main",
              }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" gutterBottom>
              Select a conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a chat from the sidebar to start messaging with customers
            </Typography>
          </Card>
        </Box>
      );
    }

    const currentUser = chatUsers.find((u) => u.id === selectedChat.user_id);

    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Chat Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <OnlineIcon
                    sx={{
                      width: 12,
                      height: 12,
                      color: getStatusColor(currentUser?.status || "offline"),
                    }}
                  />
                }
              >
                <Avatar
                  src={selectedChat.user_avatar}
                  sx={{
                    width: 48,
                    height: 48,
                    cursor: "pointer",
                  }}
                  onClick={() => currentUser && handleProfileClick(currentUser)}
                >
                  {selectedChat.user_name.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
              <Box>
                <Typography variant="h6" fontWeight={500}>
                  {selectedChat.user_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser?.status === "online"
                    ? "Online"
                    : currentUser?.last_seen
                      ? formatLastSeen(currentUser.last_seen)
                      : "Offline"}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Voice Call">
                <IconButton>
                  <CallIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Video Call">
                <IconButton>
                  <VideoIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            backgroundColor: "#f5f5f5",
            backgroundImage: `linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%), 
                             linear-gradient(-45deg, transparent 25%, rgba(255,255,255,0.1) 25%), 
                             linear-gradient(45deg, rgba(255,255,255,0.1) 75%, transparent 75%), 
                             linear-gradient(-45deg, rgba(255,255,255,0.1) 75%, transparent 75%)`,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          }}
        >
          <Stack spacing={1}>
            {selectedChat.messages.map((message, index) => {
              const isAdmin = message.sender_type === "admin";
              const isLastInGroup =
                index === selectedChat.messages.length - 1 ||
                selectedChat.messages[index + 1]?.sender_type !==
                  message.sender_type;

              return (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent: isAdmin ? "flex-end" : "flex-start",
                    mb: isLastInGroup ? 1 : 0.5,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: "70%",
                      backgroundColor: isAdmin
                        ? "primary.main"
                        : "background.paper",
                      color: isAdmin ? "primary.contrastText" : "text.primary",
                      borderRadius: 2,
                      borderTopRightRadius: isAdmin && isLastInGroup ? 0.5 : 2,
                      borderTopLeftRadius: !isAdmin && isLastInGroup ? 0.5 : 2,
                      boxShadow: 1,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ wordBreak: "break-word" }}
                    >
                      {message.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        textAlign: "right",
                        mt: 0.5,
                        opacity: 0.8,
                      }}
                    >
                      {dayjs(message.timestamp).format("h:mm A")}
                    </Typography>
                  </Paper>
                </Box>
              );
            })}
          </Stack>
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <IconButton size="small">
              <AttachIcon />
            </IconButton>
            <TextField
              ref={messageInputRef}
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                },
              }}
            />
            <IconButton size="small">
              <EmojiIcon />
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                "&:disabled": {
                  backgroundColor: "grey.300",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        backgroundColor: "background.default",
      }}
    >
      {/* Mobile: Drawer for sidebar */}
      {isMobile ? (
        <>
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              "& .MuiDrawer-paper": {
                width: 320,
                boxSizing: "border-box",
              },
            }}
          >
            <ChatSidebar />
          </Drawer>
          {selectedChat ? (
            <ChatArea />
          ) : (
            <Box sx={{ flex: 1, p: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ mb: 2 }}
              >
                Show Conversations
              </Button>
              <ChatArea />
            </Box>
          )}
        </>
      ) : (
        /* Desktop: Side-by-side layout */
        <>
          <ChatSidebar />
          <ChatArea />
        </>
      )}

      {/* Chat Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (currentUser) handleProfileClick(currentUser);
          }}
        >
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>User Info</ListItemText>
        </MenuItem>
      </Menu>

      {/* User Profile Drawer */}
      <Drawer
        anchor="right"
        open={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: isMobile ? "100%" : 400,
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Typography variant="h6">User Profile</Typography>
            <IconButton onClick={() => setProfileDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {selectedUser && (
            <>
              {editingUser ? (
                /* Edit Mode */
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ textAlign: "center" }}>
                      <Avatar
                        src={profileFormData.avatar}
                        sx={{ width: 100, height: 100, margin: "0 auto 16px" }}
                      >
                        {profileFormData.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <TextField
                        fullWidth
                        label="Avatar URL"
                        value={profileFormData.avatar}
                        onChange={(e) =>
                          setProfileFormData({
                            ...profileFormData,
                            avatar: e.target.value,
                          })
                        }
                        margin="normal"
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={profileFormData.name}
                        onChange={(e) =>
                          setProfileFormData({
                            ...profileFormData,
                            name: e.target.value,
                          })
                        }
                        error={!!profileErrors.name}
                        helperText={profileErrors.name}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileFormData.email}
                        onChange={(e) =>
                          setProfileFormData({
                            ...profileFormData,
                            email: e.target.value,
                          })
                        }
                        error={!!profileErrors.email}
                        helperText={profileErrors.email}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={profileFormData.phone}
                        onChange={(e) =>
                          setProfileFormData({
                            ...profileFormData,
                            phone: e.target.value,
                          })
                        }
                        error={!!profileErrors.phone}
                        helperText={profileErrors.phone}
                        required
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="flex-end"
                      >
                        <Button
                          variant="outlined"
                          onClick={() => setEditingUser(null)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSaveProfile}
                          disabled={loading}
                        >
                          Save Changes
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                /* View Mode */
                <Box>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        <OnlineIcon
                          sx={{
                            width: 16,
                            height: 16,
                            color: getStatusColor(selectedUser.status),
                          }}
                        />
                      }
                    >
                      <Avatar
                        src={selectedUser.avatar}
                        sx={{ width: 120, height: 120, margin: "0 auto" }}
                      >
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                    <Typography variant="h5" fontWeight={500} mt={2}>
                      {selectedUser.name}
                    </Typography>
                    <Chip
                      label={selectedUser.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(selectedUser.status),
                        color: "white",
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>

                  <Stack spacing={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          mb={1}
                        >
                          <EmailIcon color="action" />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Email
                          </Typography>
                        </Stack>
                        <Typography variant="body1">
                          {selectedUser.email}
                        </Typography>
                      </CardContent>
                    </Card>

                    <Card variant="outlined">
                      <CardContent>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          mb={1}
                        >
                          <PhoneIcon color="action" />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Phone
                          </Typography>
                        </Stack>
                        <Typography variant="body1">
                          {selectedUser.phone}
                        </Typography>
                      </CardContent>
                    </Card>

                    {selectedUser.last_seen && (
                      <Card variant="outlined">
                        <CardContent>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Last Seen
                          </Typography>
                          <Typography variant="body1">
                            {formatLastSeen(selectedUser.last_seen)}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={handleEditProfile}
                      fullWidth
                    >
                      Edit Profile
                    </Button>
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default InterveneAdminChat;
