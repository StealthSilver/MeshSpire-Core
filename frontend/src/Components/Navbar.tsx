import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";

interface NavbarProps {
  isSidebarExpanded: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarExpanded }) => {
  const { username, logout, userId } = useAuth();
  const [userDropDown, setUserDropDown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`sticky top-0 z-40 backdrop-blur-xl border border-[rgba(255,255,255,0.2)] 
      bg-slate-900/70 text-white py-2 flex items-center justify-between transition-all duration-300
      ${isSidebarExpanded ? "ml-4" : "ml-4"} mr-4 rounded-xl mt-4 px-4`}
    >
      <div
        className="text-lg font-semibold cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        {username
          ? `Hello, ${username.charAt(0).toUpperCase() + username.slice(1)}`
          : "Hello, Guest"}
      </div>

      <div className="flex items-center gap-5 relative">
        <div className="relative hidden lg:flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="w-72 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.12)] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <SearchIcon className="absolute right-3 text-gray-400 cursor-pointer" />
        </div>

        <NotificationsIcon className="text-gray-300 cursor-pointer hover:text-white transition" />

        <div className="relative" ref={dropdownRef}>
          <AccountCircleIcon
            fontSize="large"
            className="text-gray-300 cursor-pointer hover:text-white transition"
            onClick={() => setUserDropDown(!userDropDown)}
          />

          {userDropDown && (
            <div
              className={`absolute -right-4 top-10 mt-3 w-40 bg-slate-900/70 backdrop-blur-md text-white rounded-xl shadow-xl border border-[rgba(255,255,255,0.15)] 
    transform transition-all duration-300 ease-out
    ${
      userDropDown
        ? "opacity-100 translate-y-0"
        : "opacity-0 -translate-y-3 pointer-events-none"
    }`}
            >
              <div className="px-4 py-2 border-b border-gray-700">
                {username
                  ? `Hello, ${
                      username.charAt(0).toUpperCase() + username.slice(1)
                    }`
                  : "Hello, Guest"}
              </div>
              <div
                className="px-4 py-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition"
                onClick={() => navigate(`/profile/${userId}`)}
              >
                Profile
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-600 transition rounded-b-xl"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
