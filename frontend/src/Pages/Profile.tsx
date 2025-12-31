"use client";
import React, { useState, useEffect } from "react";
import { FaUserAlt } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";
import API from "../api";
import { useNavigate, useParams } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CakeIcon from "@mui/icons-material/Cake";
import SchoolIcon from "@mui/icons-material/School";
import LanguageIcon from "@mui/icons-material/Language";
import WorkIcon from "@mui/icons-material/Work";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface User {
  name: string;
  email?: string;
  gender: string;
  age?: number;
  avatar?: string;
  bio?: string;
  skills?: string[];
  role: string;
  languages?: string[];
  class: number;
  subject: string;
}

const Profile: React.FC = () => {
  const { userId } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to convert text to sentence case
  const toSentenceCase = (text: string) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  useEffect(() => {
    const profileId = id || userId;
    if (!profileId) return;

    const fetchData = async () => {
      try {
        const userRes = await API.get(`/user/me`);
        const { name, email, role: accountRole } = userRes.data;

        let profileData: Partial<User> = {};
        try {
          const profileRes = await API.get(`/profile/${profileId}`);
          profileData = profileRes.data;
        } catch {
          console.log("No profile data found, using default values.");
        }

        setUser({
          name,
          email,
          gender: profileData.gender || "Not specified",
          age: profileData.age || 0,
          class: profileData.class || 0,
          avatar: profileData.avatar || "",
          bio: profileData.bio || "No bio added yet.",
          skills: profileData.skills || [],
          role: profileData.role || accountRole || "Member",
          languages: profileData.languages || [],
          subject: profileData.subject || "",
        });
      } catch (err) {
        console.error("Error fetching user info:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, id]);

  const Skeleton = () => (
    <div className="animate-pulse w-full max-w-6xl">
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-emerald-900/30 via-green-900/20 to-slate-900/30"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col items-center -mt-20">
            <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-900"></div>
            <div className="w-48 h-8 bg-slate-800 rounded-lg mt-4"></div>
            <div className="w-32 h-6 bg-slate-800 rounded-lg mt-2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-x-hidden">
      <main className="flex flex-col items-center justify-start px-4 sm:px-6 py-8 md:py-10">
        {loading ? (
          <Skeleton />
        ) : !user ? (
          <div className="w-full max-w-6xl bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center mx-auto mb-6">
              <PersonIcon className="text-6xl text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Profile Not Found
            </h2>
            <p className="text-gray-400 mb-6">
              We couldn't find the profile you're looking for.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-emerald-500/50"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="w-full max-w-6xl">
            {/* Cover Section with Avatar */}
            <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-r from-emerald-900/30 via-green-900/20 to-slate-900/30 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
              </div>

              {/* Profile Header */}
              <div className="px-6 sm:px-8 pb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20">
                  {/* Avatar */}
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-slate-900 shadow-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center border-4 border-slate-900 shadow-xl">
                        <FaUserAlt className="text-5xl text-white" />
                      </div>
                    )}
                  </div>

                  {/* Name and Role */}
                  <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      {toSentenceCase(user.name)}
                    </h1>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold">
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400">
                      <EmailIcon className="text-lg" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        navigate(
                          user.role === "tutor"
                            ? "/tutor-dashboard"
                            : "/dashboard"
                        )
                      }
                      className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
                    >
                      <ArrowBackIcon className="text-lg" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <button
                      onClick={() => navigate("/update-profile")}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl font-semibold transition-all shadow-lg hover:shadow-emerald-500/50 flex items-center gap-2"
                    >
                      <EditIcon className="text-lg" />
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>

                {/* Bio Section */}
                {user.bio && (
                  <div className="mt-8 bg-slate-800/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                      <PersonIcon className="text-emerald-400" />
                      About
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Skills */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <WorkIcon className="text-emerald-400" />
                      Skills
                    </h3>
                    {user.skills && user.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No skills added yet
                      </p>
                    )}
                  </div>

                  {/* Languages */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <LanguageIcon className="text-emerald-400" />
                      Languages
                    </h3>
                    {user.languages && user.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.languages.map((language, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-lg text-green-300 text-sm"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No languages added yet
                      </p>
                    )}
                  </div>

                  {/* Personal Info */}
                  {(user.gender !== "Not specified" ||
                    (user.age && user.age > 0)) && (
                    <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <PersonIcon className="text-emerald-400" />
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        {user.gender !== "Not specified" && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                              <PersonIcon className="text-emerald-400 text-lg" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Gender</p>
                              <p className="text-white font-medium">
                                {user.gender}
                              </p>
                            </div>
                          </div>
                        )}
                        {user.age && user.age > 0 && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                              <CakeIcon className="text-green-400 text-lg" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Age</p>
                              <p className="text-white font-medium">
                                {user.age} years
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Academic Info */}
                  {user.class > 0 && (
                    <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <SchoolIcon className="text-emerald-400" />
                        Academic Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                            <SchoolIcon className="text-emerald-400 text-lg" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Class</p>
                            <p className="text-white font-medium">
                              Grade {user.class}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
