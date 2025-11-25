import React, { createContext, useEffect, useState, useContext, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { AuthContext } from "../components/AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [groupInvitations, setGroupInvitations] = useState([]); // pending invites
  const [groupMessages, setGroupMessages] = useState({}); // { "<groupId>": [msg, ...] }
  const [groups, setGroups] = useState([]); // [{id, name, code}]
  const { username, token, logout } = useContext(AuthContext);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Helper: ensure group id used as string key everywhere
  const gid = (g) => (g == null ? null : String(g));

  // Helper: add group to groups state if missing
  const addGroupIfMissing = (group) => {
    if (!group || !group.id) return;
    setGroups((prev) => {
      const exists = prev.some((g) => String(g.id) === String(group.id));
      return exists ? prev : [...prev, group];
    });
  };

  // Helper: push message to a group's message array (string-keyed)
  const pushGroupMessage = (groupId, message) => {
    if (!groupId) return;
    const key = String(groupId);
    setGroupMessages((prev) => {
      const copy = { ...prev };
      const arr = copy[key] ? [...copy[key]] : [];
      arr.push(message);
      copy[key] = arr;
      return copy;
    });
  };

  // Send helper
  const sendWS = (payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // ---------------------------------------------------
  // WebSocket connect / handlers
  // ---------------------------------------------------
  useEffect(() => {
    if (!username || !token) return;

    const connectWebSocket = () => {
      // ✅ Avoid duplicate connections
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        console.log("⚠ WebSocket already connected/connecting");
        return;
      }

      wsRef.current = new WebSocket(`ws://192.168.20.40:8000/ws/notifications/?token=${token}`);

      wsRef.current.onopen = () => {
        console.log("✅ Connected to WebSocket");
      };

      wsRef.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          console.log("📩 WS message received:", msg);

          // 🎯 Student homework notification
          if (msg.type === "homework_notification" && msg.role === "student") {
            const { notification, homework } = msg;
            const newNotification = {
              id: notification?.id ?? Date.now().toString(),
              title: homework?.title || "New Homework",
              image: homework?.attachment || "/default-homework-image.jpeg",
              message:
                notification?.message || "You have a new homework update.",
              timestamp:
                notification?.timestamp ||
                homework?.date_assigned ||
                new Date().toISOString(),
              read: false,
              type: "homework",
              homework,
              _notification: notification,
            };

            setNotifications((prev) => {
              const exists = prev.some((n) => n.id === newNotification.id);
              return exists ? prev : [newNotification, ...prev];
            });
            return;
          }

          if (msg.type === "teacher_ack") {
            const uniqueId = `${msg.class_work_id || msg.homework_id || msg.submission_id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newNotification = {
              id: uniqueId,
              title: msg.title || "Action Acknowledged",
              message: msg.message || "Homework successfully dispatched to class.",
              timestamp: msg.timestamp || new Date().toISOString(),
              read: false,
              type: "homework-dispatch",
              _raw: msg,
            };
            setNotifications((prev) => [newNotification, ...prev]);
            return;
          }

          if (msg.type === "classwork_completion_notification" || msg.type === "homework_completion_notification") {
            const newNotification = {
              id: msg.submission_id ?? Date.now().toString(),
              title: msg.type === "classwork_completion_notification" ? "Classwork Completed" : "Homework Completed",
              message: msg.message || "Your submission has been processed.",
              summary: msg.summary || null,
              timestamp: msg.timestamp || new Date().toISOString(),
              read: false,
              type: msg.type,
              submissionId: msg.submission_id,
              _raw: msg,
            };

            setNotifications((prev) => {
              const exists = prev.some((n) => n.id === newNotification.id);
              return exists ? prev : [newNotification, ...prev];
            });
            return;
          }

          // ---------------------------------------
          // GROUP CHAT: events from backend consumer.py
          // ---------------------------------------

          // 1) Creator receives confirmation when group is created (server sends create_group_result)
          if (msg.type === "create_group_result") {
            if (msg.success && msg.group) {
              addGroupIfMissing(msg.group);
              // optional: initialize empty messages list
              setGroupMessages((prev) => ({ ...prev, [gid(msg.group.id)]: prev[gid(msg.group.id)] || [] }));
            }
            return;
          }

          // 2) Invite received
          if (msg.type === "group_invitation") {
            // msg.group, msg.inviter, msg.timestamp
            setGroupInvitations((prev) => {
              // avoid duplicates for same group + inviter
              const exists = prev.some((i) => String(i.group?.id) === String(msg.group?.id) && i.inviter?.username === msg.inviter?.username);
              if (exists) return prev;
              return [{ group: msg.group, inviter: msg.inviter, timestamp: msg.timestamp }, ...prev];
            });
            return;
          }

          // 3) When a user accepts an invite, server sends group_joined to the acceptor
          if (msg.type === "group_joined") {
            // msg.group
            const group = msg.group;
            if (group) {
              addGroupIfMissing(group);
              // clear invite for that group (if any)
              setGroupInvitations((prev) => prev.filter((i) => String(i.group.id) !== String(group.id)));
              // ensure messages array exists
              setGroupMessages((prev) => ({ ...prev, [gid(group.id)]: prev[gid(group.id)] || [] }));
            }
            return;
          }

          // 4) Invite was ignored (client receives invite_ignored)
          if (msg.type === "invite_ignored") {
            const group = msg.group;
            if (group) {
              setGroupInvitations((prev) => prev.filter((i) => String(i.group.id) !== String(group.id)));
            }
            return;
          }

          // 5) Group broadcast message
          if (msg.type === "group_message") {
            const groupId = msg?.group?.id;
            const normalized = {
              ...msg,
              timestamp: msg.timestamp || new Date().toISOString()
            };
            pushGroupMessage(groupId, normalized);
            // If group not known (edge case), add it
            if (msg.group) addGroupIfMissing(msg.group);
            return;
          }

          // 6) Group system message (join/leave announcements)
          if (msg.type === "group_system_message") {
            const groupId = msg?.group?.id;
            const normalized = {
              type: "group_system_message",
              group: msg.group,
              message: msg.message,
              actor: msg.actor,
              timestamp: msg.timestamp || new Date().toISOString()
            };
            pushGroupMessage(groupId, normalized);
            // ensure group exists in group list
            if (msg.group) addGroupIfMissing(msg.group);
            return;
          }

          // 7) Inviter gets a response notify (invitee accepted/ignored)
          // Backend sends group_invite_response_notify to the inviter's user group
          if (msg.type === "group_invite_response_notify") {
            // Put a small notification in notifications area
            setNotifications((prev) => [
              {
                id: `${Date.now()}-${Math.random()}`,
                title: "Group Invitation Response",
                message: `${msg.invitee?.fullname || msg.invitee?.username} has ${msg.accepted ? "accepted" : "ignored"} your invite to "${msg.group?.name || ''}"`,
                timestamp: msg.timestamp || new Date().toISOString(),
                read: false,
                type: "group-invite-response",
                _raw: msg,
              },
              ...prev,
            ]);

            // Also push a system message into the group chat so the creator/inviter sees the acceptance in chat
            if (msg.group && msg.group.id) {
              const sysMsg = {
                type: "group_system_message",
                group: msg.group,
                message: `${msg.invitee?.fullname || msg.invitee?.username} has ${msg.accepted ? "joined" : "ignored"} the group.`,
                actor: msg.invitee?.username,
                timestamp: msg.timestamp || new Date().toISOString()
              };
              pushGroupMessage(msg.group.id, sysMsg);
              addGroupIfMissing(msg.group);
            }
            return;
          }

          // Unhandled message — keep for debug
          console.log("📩 Unhandled WS message:", msg);
        } catch (err) {
          console.error("❌ Error parsing WS message", err);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error("❌ WebSocket error", err);
      };

      wsRef.current.onclose = () => {
        console.log("⚠ WebSocket closed");
        // optional reconnect strategy (disabled here to avoid duplicate reconnections)
        // reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [username, token]); // re-connect when user/token changes
  // ---------------------------------------------------
  // Exposed actions for groups
  // ---------------------------------------------------
  const createGroup = (name, invitees = []) => {
    sendWS({ action: "create_group", group_name: name, invitees });
    // we wait for create_group_result from server to add group to state
  };

  const inviteToGroup = (groupId, invitees = []) => {
    sendWS({ action: "invite_to_group", group_id: groupId, invitees });
  };

  const respondToGroupInvite = (groupId, response) => {
    sendWS({ action: "group_invite_response", group_id: groupId, response });
  };

  const sendGroupMessage = (groupId, message) => {
    sendWS({ action: "send_group_message", group_id: groupId, message });
    // optimistic UI: append message immediately as sender
    const optimistic = {
      type: "group_message",
      group: { id: groupId },
      sender: { username },
      message,
      timestamp: new Date().toISOString()
    };
    pushGroupMessage(groupId, optimistic);
  };

  // ---------------------------------------------------
  // Notification helpers (existing)
  // ---------------------------------------------------
  const markNotificationAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      sendWS({ action: "mark_read", notification_id: id });
      await axiosInstance.post(`/notifications/${id}/read/`);
    } catch (error) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    }
  };

  const clearAllNotifications = async () => {
    const unread = notifications.filter((n) => !n.read);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await Promise.all(unread.map((n) => axiosInstance.post(`/notifications/${n.id}/read/`).catch(() => null)));
    } catch (_) {}
  };

  const getUnreadCount = () => notifications.filter((notif) => !notif.read).length;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        groupInvitations,
        groupMessages,
        groups,

        createGroup,
        inviteToGroup,
        respondToGroupInvite,
        sendGroupMessage,

        markNotificationAsRead,
        clearAllNotifications,
        getUnreadCount,
        handleLogout,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
