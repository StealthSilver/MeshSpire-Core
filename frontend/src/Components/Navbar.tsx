import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import API from "../api";
import NotificationDropdown from "./NotificationDropdown";

interface NavbarProps {
  isSidebarExpanded: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarExpanded }) => {
  const { username, logout, userId, role } = useAuth();
  const [userDropDown, setUserDropDown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRes = await API.get(`/profile/${userId}`);
        setAvatar(userRes.data.avatar);
        setName(userRes.data.name);
      } catch (err) {
        console.error("error while fetching avatar");
      }
    };
    fetchUser();
  }, [userId]);

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
      className={`flex-shrink-0 z-50 backdrop-blur-xl border border-[rgba(255,255,255,0.2)] 
      bg-slate-900/70 text-white py-2 sm:py-3 flex items-center justify-between transition-all duration-300
      mx-2 sm:mx-4 rounded-xl mt-2 sm:mt-4 px-3 sm:px-4 max-w-full`}
    >
      <div className="text-sm sm:text-base lg:text-lg font-semibold cursor-pointer transition-all duration-300 truncate max-w-[140px] sm:max-w-[200px] lg:max-w-none">
        {name
          ? `Hello, ${
              name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
            }`
          : `Hello, ${
              username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()
            }`}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 relative flex-shrink-0">
        <div
          className={`relative flex items-center transition-all duration-300 ${
            isSidebarExpanded ? "hidden xl:flex" : "hidden lg:flex"
          }`}
        >
          <input
            type="text"
            placeholder="Search..."
            className={`px-3 sm:px-4 py-2 rounded-full bg-[rgba(255,255,255,0.12)] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm sm:text-base
              ${isSidebarExpanded ? "w-48 xl:w-64" : "w-56 lg:w-72"}`}
          />
          <SearchIcon className="absolute right-3 text-gray-400 cursor-pointer text-lg sm:text-xl" />
        </div>

        <NotificationDropdown isSidebarExpanded={isSidebarExpanded} />

        <div className="relative" ref={dropdownRef}>
          {avatar ? (
            <img
              src={avatar || "/default-avatar.png"}
              alt="User Avatar"
              className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 cursor-pointer rounded-full border border-gray-600 hover:scale-105 transition-transform duration-200 object-cover"
              onClick={() => setUserDropDown(!userDropDown)}
            />
          ) : (
            <AccountCircleIcon
              className="text-gray-300 cursor-pointer hover:text-white transition text-xl sm:text-2xl lg:text-3xl"
              onClick={() => setUserDropDown(!userDropDown)}
            />
          )}

          {userDropDown && (
            <div
              className={`absolute -right-2 sm:-right-4 top-8 sm:top-10 mt-2 sm:mt-3 w-36 sm:w-40 bg-slate-900/90 backdrop-blur-md text-white rounded-xl shadow-xl border border-[rgba(255,255,255,0.15)] 
              transform transition-all duration-300 ease-out z-50
              ${
                userDropDown
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-3 pointer-events-none"
              }`}
            >
              <div className="px-3 sm:px-4 py-2 border-b border-gray-700 text-xs sm:text-sm truncate">
                {name
                  ? `Hello, ${
                      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
                    }`
                  : `Hello, ${
                      username.charAt(0).toUpperCase() +
                      username.slice(1).toLowerCase()
                    }`}
              </div>
              {role === "tutor" ? (
                <>
                  <div
                    className="px-3 sm:px-4 py-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition text-xs sm:text-sm"
                    onClick={() => navigate(`/tutor-profile/${userId}`)}
                  >
                    Profile
                  </div>

                  <div
                    className="px-3 sm:px-4 py-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition text-xs sm:text-sm"
                    onClick={() => navigate(`/update-tutor-profile`)}
                  >
                    Update Profile
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="px-3 sm:px-4 py-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition text-xs sm:text-sm"
                    onClick={() => navigate(`/profile/${userId}`)}
                  >
                    Profile
                  </div>

                  <div
                    className="px-3 sm:px-4 py-2 cursor-pointer hover:bg-[rgba(255,255,255,0.1)] transition text-xs sm:text-sm"
                    onClick={() => navigate(`/update-profile`)}
                  >
                    Update Profile
                  </div>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 sm:px-4 py-2 hover:bg-red-600 transition rounded-b-xl text-xs sm:text-sm"
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
