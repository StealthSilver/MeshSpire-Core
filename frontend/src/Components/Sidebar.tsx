import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getUnreadCount } from "../api/chat";
import { useSocket } from "../providers/SocketProvider";
import logo from "../assets/favicon.svg";
import ExpandedLogo from "../assets/logo_dark.svg";
import HomeIcon from "@mui/icons-material/Home";
import ChatIcon from "@mui/icons-material/Chat";
import SettingsIcon from "@mui/icons-material/Settings";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EqualizerIcon from "@mui/icons-material/Equalizer";

interface SidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onExpandChange }) => {
  const [active, setActive] = useState("home");
  const [indicatorTop, setIndicatorTop] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
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
      path: "/dashboard/#analytics",
    },
    {
      id: "settings",
      icon: <SettingsIcon />,
      label: "Settings",
      path: "/dashboard/#settings",
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
      setIndicatorTop(iconCenter - 16);
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

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      // expand only on desktop
      setIsExpanded(true);
      onExpandChange?.(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      setIsExpanded(false);
      onExpandChange?.(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden z-200 md:flex m-4 shadow-2xl flex-col items-center py-4 gap-6 h-[97%] fixed rounded-xl
        backdrop-blur-xl bg-slate-900/70 border border-[rgba(255,255,255,0.2)]
        transition-all duration-300 ease-in-out
        ${isExpanded ? "w-52" : "w-16"}
      `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo */}
        <div className="flex items-center justify-center w-full">
          {isExpanded ? (
            <img
              src={ExpandedLogo}
              alt="Logo"
              className="transition-all duration-500 w-40"
            />
          ) : (
            <img
              src={logo}
              alt="Logo"
              className="transition-all duration-500 w-10"
            />
          )}
        </div>

        {/* Sidebar Buttons */}
        <div className="relative w-full flex flex-col items-start mt-4 px-2">
          <div
            className="absolute left-0 w-[4px] h-8 bg-white rounded-tr-md rounded-br-md transition-all duration-500"
            style={{ top: indicatorTop }}
          />

          {buttons.map((btn, index) => (
            <button
              key={btn.id}
              ref={(el) => {
                buttonsRef.current[index] = el;
              }}
              onClick={() => handleClick(btn.id, btn.path)}
              className={`group relative flex items-center w-full py-3 px-3 my-1 rounded-xl transition-all duration-300
                ${
                  active === btn.id
                    ? "bg-gray-800 text-white"
                    : "text-gray-200 hover:bg-gray-800 hover:text-white"
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
              <span
                className={`ml-4 text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
                  isExpanded ? "opacity-100" : "opacity-0"
                }`}
              >
                {btn.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-white/10 flex justify-around items-center py-2 z-50 md:hidden">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => handleClick(btn.id, btn.path)}
            className={`flex flex-col items-center justify-center text-xs relative ${
              active === btn.id
                ? "text-green-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="text-[1.6rem] relative">
              {btn.icon}
              {btn.id === "chat" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default Sidebar;
