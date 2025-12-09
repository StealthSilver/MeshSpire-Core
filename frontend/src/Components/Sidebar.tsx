import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getUnreadCount } from "../api/chat";
import { useSocket } from "../providers/SocketProvider";
import logo from "../assets/favicon.svg";
import HomeIcon from "@mui/icons-material/Home";
import ChatIcon from "@mui/icons-material/Chat";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EqualizerIcon from "@mui/icons-material/Equalizer";

const Sidebar: React.FC = () => {
  const [active, setActive] = useState("home");
  const [indicatorTop, setIndicatorTop] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const { socket } = useSocket();

  const buttons = [
    {
      id: "home",
      icon: <HomeIcon />,
      label: "Home",
      path: role === "tutor" ? "/tutor-dashboard" : "/dashboard",
    },
    {
      id: "chat",
      icon: <ChatIcon />,
      label: "Chat",
      path: role === "tutor" ? "/tutor-dashboard/chat" : "/dashboard/chat",
    },
    {
      id: "calendar",
      icon: <CalendarTodayIcon />,
      label: "Calendar",
      path:
        role === "tutor" ? "/tutor-dashboard/calendar" : "/dashboard/calendar",
    },
    {
      id: "analytics",
      icon: <EqualizerIcon />,
      label: "Analytics",
      path:
        role === "tutor"
          ? "/tutor-dashboard/analytics"
          : "/dashboard/analytics",
    },
    {
      id: "settings",
      icon: <SettingsIcon />,
      label: "Settings",
      path:
        role === "tutor" ? "/tutor-dashboard/settings" : "/dashboard/settings",
    },
  ];

  // Set active button based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const activeButton = buttons.find((btn) => btn.path === currentPath);
    if (activeButton) {
      setActive(activeButton.id);
    } else {
      // Default to home if no match
      setActive("home");
    }
  }, [location.pathname, role]);

  useEffect(() => {
    const activeIndex = buttons.findIndex((btn) => btn.id === active);
    const btn = buttonsRef.current[activeIndex];
    if (btn) {
      const iconCenter = btn.offsetTop + btn.offsetHeight / 2;
      setIndicatorTop(iconCenter - 20);
    }
  }, [active]);

  useEffect(() => {
    // Fetch unread count initially
    fetchUnreadCount();

    // Listen for new messages to update the badge
    socket.on("new-message", () => {
      fetchUnreadCount();
    });

    // Listen for new conversations
    socket.on("conversation-created", () => {
      fetchUnreadCount();
    });

    return () => {
      socket.off("new-message");
      socket.off("conversation-created");
    };
  }, [socket]);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleClick = (id: string, path: string) => {
    setActive(id);
    navigate(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden z-200 md:flex m-4 shadow-2xl flex-col items-center py-4 gap-6 h-[97%] fixed rounded-xl
        backdrop-blur-xl bg-slate-900/80 border border-white/10 w-20"
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center w-full cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img src={logo} alt="Logo" className="w-10" />
        </div>

        {/* Sidebar Buttons */}
        <div className="relative w-full flex flex-col items-center mt-4 px-2">
          <div
            className="absolute left-0 w-[4px] h-10 bg-green-400 rounded-tr-md rounded-br-md transition-all duration-300"
            style={{ top: indicatorTop }}
          />

          {buttons.map((btn, index) => (
            <button
              key={btn.id}
              ref={(el) => {
                buttonsRef.current[index] = el;
              }}
              onClick={() => handleClick(btn.id, btn.path)}
              className={`group relative flex items-center justify-center w-full py-3 my-1 rounded-xl transition-all duration-300
                ${
                  active === btn.id
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span className="text-[1.6rem] flex justify-center items-center relative">
                {btn.icon}
                {btn.id === "chat" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              {/* Tooltip */}
              <span className="absolute left-full ml-4 px-3 py-2 bg-slate-800/95 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 border border-white/10">
                {btn.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center py-3 z-50 md:hidden">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleClick(btn.id, btn.path)}
            className={`flex flex-col items-center justify-center text-xs relative transition-colors duration-200 ${
              active === btn.id
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="text-[1.4rem] relative mb-1">
              {btn.icon}
              {btn.id === "chat" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className="text-[10px]">{btn.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
