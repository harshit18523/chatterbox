import { useState, useEffect, useRef, type SubmitEvent } from "react";
import { io, Socket } from "socket.io-client";
import api from "../utils/api";
import JoinPrivateRoomModal from "../components/JoinPrivateRoomModal";

interface UserResult {
  _id: string;
  username: string;
}

interface RoomResult {
  _id: string;
  name: string;
  isPrivate: boolean;
}

interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    username: string;
  };
  content: string;
  createdAt: string;
}

export default function Dashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [rooms, setRooms] = useState<RoomResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeRoom, setActiveRoom] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (!activeRoom) {
      return;
    }
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/room/${activeRoom.id}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to load chat history", error);
      }
    };
    fetchHistory();
    socket?.emit("join_room", activeRoom.id);
  }, [activeRoom, socket]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    const handleReceiveMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setUsers([]);
        setRooms([]);
        return;
      }
      setIsSearching(true);
      try {
        const [usersRes, roomsRes] = await Promise.all([
          api.get(`/search/users?q=${searchQuery}`),
          api.get(`/search/rooms?q=${searchQuery}`)
        ]);
        setUsers(usersRes.data);
        setRooms(roomsRes.data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token }
    });
    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, []);

  const handleSendMessage = (e: SubmitEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || !socket) {
      return;
    }
    socket.emit("send_message", {
      roomId: activeRoom.id,
      content: newMessage.trim()
    });
    setNewMessage("");
  };

  const handleJoinPrivateRoom = async (code: string) => {
    return new Promise<void>((resolve, reject) => {
      socket?.emit("join_private_room", { code }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar for Search & Room List */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-100">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users or rooms..." 
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isSearching && <p className="text-sm text-gray-500">Searching...</p>}
          
          {/* Render Room Results */}
          {rooms.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rooms</h4>
              {rooms.map(room => (
                <button key={room._id} className="w-full text-left p-2 rounded-lg hover:bg-blue-50 transition-colors font-medium flex justify-between items-center">
                  <span># {room.name}</span>
                  {room.isPrivate && <span className="text-xs text-red-500">Private</span>}
                </button>
              ))}
            </div>
          )}

          {/* Render User Results */}
          {users.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Users</h4>
              {users.map(user => (
                <button key={user._id} className="w-full text-left p-2 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                  @ {user.username}
                </button>
              ))}
            </div>
          )}

          {!isSearching && searchQuery && rooms.length === 0 && users.length === 0 && (
            <p className="text-sm text-gray-500">No results found.</p>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white">
        {activeRoom ? (
          <>
            <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
              <h2 className="text-xl font-bold"># {activeRoom.name}</h2>
            </header>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((msg) => {
                const isMe = msg.sender._id === currentUserId;
                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500 mb-1 ml-1">
                      {isMe ? 'You' : msg.sender.username}
                    </span> 
                    <div className={`px-4 py-2 rounded-2xl max-w-md wrap-break-word shadow-sm ${
                      isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <p className="text-gray-400 text-lg">Select a user or room to start chatting.</p>
          </div>
        )}
      </main>
      <JoinPrivateRoomModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={handleJoinPrivateRoom}
      />
    </div>
  );
}
