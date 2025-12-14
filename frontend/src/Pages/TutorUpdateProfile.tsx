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
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import DescriptionIcon from "@mui/icons-material/Description";
import MenuBookIcon from "@mui/icons-material/MenuBook";

interface User {
  name: string;
  email: string;
  gender: string;
  age?: number;
  avatar?: string;
  bio?: string;
  skills?: string;
  role: string;
  languages?: string;
  subjects: string[];
  experience?: number;
  hourlyRate?: number;
  qualification?: string;
  document?: string[];
  resume?: string;
}

const subjectsList = [
  "Mathematics",
  "Science",
  "English",
  "Computer Science",
  "Hindi",
  "Biology",
  "Physics",
  "Chemistry",
];

const TutorUpdateProfile: React.FC = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    gender: "",
    age: undefined,
    avatar: "",
    bio: "",
    skills: "",
    role: "",
    languages: "",
    subjects: [],
    experience: undefined,
    hourlyRate: undefined,
    qualification: "",
    document: [],
    resume: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<File[]>([]);
  const [selectedResume, setSelectedResume] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string[]>([]);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
          age: profileData.age ? Number(profileData.age) : undefined,
          avatar: profileData.avatar || "",
          bio: profileData.bio || "",
          skills: Array.isArray(profileData.skills)
            ? profileData.skills.join(", ")
            : profileData.skills || "",

          // prefer profile role if present else fallback to account role
          role: profileData.role || accountRole || "",
          languages: Array.isArray(profileData.languages)
            ? profileData.languages.join(", ")
            : profileData.languages || "",

          subjects: Array.isArray(profileData.subjects)
            ? profileData.subjects
            : typeof profileData.subjects === "string"
            ? profileData.subjects.split(",").map((s: string) => s.trim())
            : [],

          experience: profileData.experience
            ? Number(profileData.experience)
            : undefined,

          hourlyRate: profileData.hourlyRate
            ? Number(profileData.hourlyRate)
            : undefined,

          qualification: Array.isArray(profileData.qualification)
            ? profileData.qualification.join(", ")
            : profileData.qualification || "",

          document: profileData.document || [],
          resume: profileData.resume || "",
        });
        setPreview(profileData.avatar || undefined);

        if (Array.isArray(profileData.document)) {
          setDocumentPreview(profileData.document);
        }

        if (profileData.resume) {
          setResumePreview(profileData.resume);
        }
        setSelectedSubjects(
          Array.isArray(profileData.subjects)
            ? profileData.subjects
            : typeof profileData.subjects === "string"
            ? profileData.subjects.split(",").map((s: string) => s.trim())
            : []
        );
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
    const { name, value, type } = e.target;

    // Clear validation errors when user starts fixing issues
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      setMessage(null);
    }

    // Handle number inputs to avoid "0" display
    if (type === "number") {
      setUser((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      setMessage("Image size is too large! Please upload an image under 2 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setUser((prev) => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);

    // Append new files to existing selectedDocument
    setSelectedDocument((prev) => [...prev, ...newFiles]);

    // Update preview list
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setDocumentPreview((prev) => [...prev, ...newPreviews]);
    setUser((prev) => ({
      ...prev,
      document: [
        ...(prev.document || []),
        ...newFiles.map((file) => file.name),
      ],
    }));

    // Clear validation errors when user uploads documents
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      setMessage(null);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedResume(file);

      const url = URL.createObjectURL(file);
      setResumePreview(url);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreview(undefined);
    setUser((prev) => ({ ...prev, avatar: "" }));
  };
  const handleCheckboxChange = (subject: string) => {
    let updatedSubjects;

    if (selectedSubjects.includes(subject)) {
      updatedSubjects = selectedSubjects.filter((item) => item !== subject);
    } else {
      updatedSubjects = [...selectedSubjects, subject];
    }

    setSelectedSubjects(updatedSubjects);

    setUser((prev) => ({
      ...prev,
      subjects: updatedSubjects,
    }));

    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
      setMessage(null);
    }
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
      formData.append("bio", user.bio || "");
      // Do NOT allow role mutation from profile update; role is fixed at signup.
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
      formData.append(
        "subjects",
        Array.isArray(user.subjects)
          ? user.subjects.map((s) => s.trim()).join(",")
          : user.subjects
          ? (user.subjects as unknown as string)
              .split(",")
              .map((l) => l.trim())
              .join(",")
          : ""
      );
      formData.append(
        "qualification",
        user.qualification
          ? user.qualification
              .split(",")
              .map((l) => l.trim())
              .join(",")
          : ""
      );
      formData.append("experience", user.experience?.toString() || "");
      formData.append("hourlyRate", user.hourlyRate?.toString() || "");

      if (selectedDocument.length > 0) {
        selectedDocument.forEach((file) => {
          formData.append("document", file);
        });
      }

      if (selectedResume) formData.append("resume", selectedResume);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else if (preview === undefined) {
        formData.append("avatar", "");
      }
      const errors: string[] = [];

      if (!user.subjects || user.subjects.length === 0) {
        errors.push("Subjects are required");
      }
      if (
        !user.experience ||
        user.experience === 0 ||
        user.experience === undefined
      ) {
        errors.push("Experience is required");
      }
      if (!user.languages || user.languages.trim() === "") {
        errors.push("Languages are required");
      }
      if (!user.qualification || user.qualification.trim() === "") {
        errors.push("Qualifications are required");
      }
      if (!user.document || user.document.length === 0) {
        errors.push("Documents are required");
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        setMessage("Please fill all required fields");
        setSaving(false);
        return;
      }

      await API.put(`/profile/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setValidationErrors([]);
      setMessage("Profile updated successfully!");
      setTimeout(() => navigate(`/tutor-profile/${userId}`), 1000);
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
          {[...Array(10)].map((_, i) => (
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
                      Edit Tutor Profile
                    </h1>
                    <p className="text-gray-400">
                      Update your professional information
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
                      value={user.age ?? ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="Enter your age"
                      min="18"
                    />
                  </div>

                  {/* Experience */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <WorkHistoryIcon className="text-emerald-400" />
                      Experience (years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={user.experience ?? ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="Years of teaching experience"
                      min="0"
                    />
                  </div>

                  {/* Hourly Rate */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <AttachMoneyIcon className="text-emerald-400" />
                      Hourly Rate (₹)
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={user.hourlyRate ?? ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="Rate in rupees"
                      min="0"
                    />
                  </div>

                  {/* Role (Read-only) */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <InfoIcon className="text-emerald-400" />
                      Role
                    </label>
                    <div className="w-full px-4 py-3 rounded-lg bg-slate-900/60 border border-white/10 text-gray-400 flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-semibold">
                        {user.role || "Tutor"}
                      </span>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <MenuBookIcon className="text-emerald-400" />
                      Subjects <span className="text-red-500">*</span>
                    </label>
                    <div
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 hover:border-emerald-500 cursor-pointer transition text-white"
                      onClick={() => setOpen(!open)}
                    >
                      {selectedSubjects.length === 0 ? (
                        <span className="text-gray-400">
                          Click to select subjects
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedSubjects.map((subject, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {open && (
                      <div className="mt-3 p-4 rounded-lg bg-slate-900/80 border border-emerald-500/50 max-h-60 overflow-y-auto">
                        {subjectsList.map((subject) => (
                          <label
                            key={subject}
                            className="flex items-center gap-3 py-2 hover:bg-slate-800 rounded px-2 cursor-pointer transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubjects.includes(subject)}
                              onChange={() => handleCheckboxChange(subject)}
                              className="cursor-pointer w-4 h-4 accent-emerald-500"
                            />
                            <span className="text-white">{subject}</span>
                          </label>
                        ))}
                      </div>
                    )}
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
                      placeholder="e.g., Problem Solving, Communication, Python"
                    />
                  </div>

                  {/* Languages */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <LanguageIcon className="text-emerald-400" />
                      Languages (comma separated){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="languages"
                      value={user.languages}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="e.g., English, Hindi, Spanish"
                    />
                  </div>

                  {/* Qualifications */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <SchoolIcon className="text-emerald-400" />
                      Qualifications (comma separated){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={user.qualification}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/80 border border-white/10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-white placeholder:text-gray-500"
                      placeholder="e.g., B.Tech, M.Sc, PhD"
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

                  {/* Documents Upload */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <DescriptionIcon className="text-emerald-400" />
                      Documents <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      multiple
                      onChange={handleDocumentUpload}
                      className="w-full text-sm text-gray-400 file:px-4 file:py-2 file:bg-emerald-600 file:text-white file:rounded-lg file:border-none file:cursor-pointer hover:file:bg-emerald-500 transition-colors"
                    />

                    {documentPreview.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {documentPreview.map((preview, index) => (
                          <div
                            key={index}
                            className="bg-slate-900/60 p-3 rounded-lg border border-white/10"
                          >
                            {preview.startsWith("data:image") ? (
                              <img
                                src={preview}
                                alt={`Doc ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-24 flex items-center justify-center bg-slate-800 rounded">
                                <DescriptionIcon className="text-emerald-400 text-3xl" />
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2 text-center truncate">
                              Doc {index + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resume Upload */}
                  <div className="bg-slate-800/40 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all md:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
                      <DescriptionIcon className="text-emerald-400" />
                      Resume
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="w-full text-sm text-gray-400 file:px-4 file:py-2 file:bg-emerald-600 file:text-white file:rounded-lg file:border-none file:cursor-pointer hover:file:bg-emerald-500 transition-colors"
                    />

                    {resumePreview && (
                      <div className="mt-4 bg-slate-900/60 p-4 rounded-lg border border-white/10 flex items-center gap-3">
                        <DescriptionIcon className="text-emerald-400 text-2xl" />
                        <div>
                          <p className="text-white text-sm font-medium">
                            {selectedResume?.name || "Resume"}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {selectedResume?.type}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
                    <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
                      <InfoIcon />
                      Please complete the following required fields:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-red-300 text-sm">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

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
                    onClick={() => navigate("/tutor-dashboard")}
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

export default TutorUpdateProfile;
