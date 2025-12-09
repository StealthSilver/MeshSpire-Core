"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { FaUserAlt } from "react-icons/fa";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CakeIcon from "@mui/icons-material/Cake";
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import LanguageIcon from "@mui/icons-material/Language";
import InfoIcon from "@mui/icons-material/Info";

interface User {
  name: string;
  email: string;
  gender: string;
  age?: number;
  class: number;
  avatar?: string;
  bio?: string;
  skills?: string;
  role: string;
  languages?: string;
}

const UpdateProfile: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    gender: "",
    age: 0,
    class: 0,
    avatar: "",
    bio: "",
    skills: "",
    role: "",
    languages: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const userRes = await API.get(`/user/me`);
        const { name, email, role: accountRole } = userRes.data;

        let profileData: any = {};
        try {
          const profileRes = await API.get(`/profile/${userId}`);
          profileData = profileRes.data;
        } catch {
          console.log("No profile data found.");
        }

        setUser({
          name,
          email,
          gender: profileData.gender || "",
          age: profileData.age || 0,
          class: profileData.class || 0,
          avatar: profileData.avatar || "",
          bio: profileData.bio || "",
          skills: profileData.skills ? profileData.skills.join(", ") : "",
          role: profileData.role || accountRole || "",
          languages: profileData.languages
            ? profileData.languages.join(", ")
            : "",
        });
        setPreview(profileData.avatar || undefined);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setUser((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreview(undefined);
    setUser((prev) => ({ ...prev, avatar: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("gender", user.gender);
      formData.append("age", user.age?.toString() || "");
      formData.append("class", user.class?.toString() || "");
      formData.append("bio", user.bio || "");
      formData.append(
        "skills",
        user.skills
          ? user.skills
              .split(",")
              .map((s) => s.trim())
              .join(",")
          : ""
      );
      formData.append(
        "languages",
        user.languages
          ? user.languages
              .split(",")
              .map((l) => l.trim())
              .join(",")
          : ""
      );

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else if (preview === undefined) {
        formData.append("avatar", "");
      }

      await API.put(`/profile/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Profile updated successfully!");
      setTimeout(() => navigate(`/profile/${userId}`), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const Skeleton = () => (
    <div className="animate-pulse w-full max-w-6xl">
      <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-slate-800"></div>
          <div className="w-48 h-6 bg-slate-800 rounded-lg mt-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-x-hidden">
      <main className="flex flex-col items-center justify-start px-4 sm:px-6 py-8 md:py-10">
        {loading ? (
          <Skeleton />
        ) : (
          <div className="w-full max-w-6xl">
            <form
              onSubmit={handleSubmit}
              className="bg-gradient-to-b from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl"
            >
              {/* Header with Avatar */}
              <div className="bg-gradient-to-r from-emerald-900/30 via-green-900/20 to-slate-900/30 p-8 border-b border-white/10">
                <div className="flex flex-col items-center gap-4">
                  {/* Avatar */}
                  <div className="relative group">
                    {preview ? (
                      <img
                        src={preview}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-slate-900 shadow-xl"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center border-4 border-slate-900 shadow-xl">
                        <FaUserAlt className="text-5xl text-white" />
                      </div>
                    )}

                    {/* Avatar Overlay Buttons */}
                    <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        id="avatarInput"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("avatarInput")?.click()
                        }
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-full transition-all shadow-lg"
                        title="Change photo"
                      >
                        <PhotoCameraIcon className="text-xl" />
                      </button>
                      {preview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-2 bg-red-600 hover:bg-red-500 rounded-full transition-all shadow-lg"
                          title="Remove photo"
                        >
                          <DeleteIcon className="text-xl" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Edit Profile
                    </h1>
                    <p className="text-gray-400">
                      Update your personal information
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <PersonIcon className="text-emerald-400" />
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={user.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <EmailIcon className="text-emerald-400" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-white/10 outline-none text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Gender */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <PersonIcon className="text-emerald-400" />
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={user.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <CakeIcon className="text-emerald-400" />
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={user.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="Enter your age"
                    />
                  </div>

                  {/* Class */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <SchoolIcon className="text-emerald-400" />
                      Class
                    </label>
                    <input
                      type="number"
                      name="class"
                      value={user.class}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="Enter your class/grade"
                    />
                  </div>

                  {/* Role (Read-only) */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <InfoIcon className="text-emerald-400" />
                      Role
                    </label>
                    <div className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-white/10 text-gray-400 flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-semibold">
                        {user.role || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <WorkIcon className="text-emerald-400" />
                      Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={user.skills}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                  </div>

                  {/* Languages */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <LanguageIcon className="text-emerald-400" />
                      Languages (comma separated)
                    </label>
                    <input
                      type="text"
                      name="languages"
                      value={user.languages}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="e.g., English, Spanish, French"
                    />
                  </div>

                  {/* Bio */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <InfoIcon className="text-emerald-400" />
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={user.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-none text-white placeholder:text-gray-500"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Success/Error Message */}
                {message && (
                  <div
                    className={`mt-6 p-4 rounded-xl border flex items-center gap-3 ${
                      message.includes("success")
                        ? "bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
                        : "bg-red-600/20 border-red-500/30 text-red-400"
                    }`}
                  >
                    <InfoIcon />
                    <span className="font-medium">{message}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        user.role === "tutor"
                          ? "/tutor-dashboard"
                          : "/dashboard"
                      )
                    }
                    className="flex-1 px-6 py-4 bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <ArrowBackIcon />
                    Back to Dashboard
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 ${
                      saving
                        ? "bg-slate-700 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 hover:shadow-emerald-500/50"
                    }`}
                  >
                    <SaveIcon />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default UpdateProfile;
