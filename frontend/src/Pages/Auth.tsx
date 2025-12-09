import { useState, useEffect } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function AuthPage() {
  const [isSignin, setIsSignin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatarUrl: "",
    isTutor: false,
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const name = params.get("name");
      const id = params.get("id");
      const roleParam = params.get("role") as "student" | "tutor" | null;

      if (token && name && id && roleParam) {
        setUser(name, token, id, roleParam);
        localStorage.setItem("token", token);
        localStorage.setItem("name", name);
        localStorage.setItem("userId", id);
        localStorage.setItem("role", roleParam);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        navigate(roleParam === "tutor" ? "/tutor-dashboard" : "/dashboard");
      }
    } catch (err) {
      console.error("Error processing OAuth callback:", err);
    }
  }, [navigate, setUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      if (isSignin) {
        const res = await API.post("/user/signin", {
          email: form.email,
          password: form.password,
        });
        setUser(
          res.data.user.name,
          res.data.access,
          res.data.user.id,
          res.data.user.role
        );
        localStorage.setItem("token", res.data.access);
        localStorage.setItem("role", res.data.user.role);
        let missing = false;

        if (res.data.user.role === "tutor") {
          const profile = await API.get(`/profile/${res.data.user.id}`);
          const u = profile.data;

          missing =
            !u.subjects?.length ||
            !u.experience ||
            !u.languages ||
            !u.qualification?.trim() ||
            !u.document?.length;
        }

        navigate(
          res.data.user.role === "tutor"
            ? missing
              ? "/update-tutor-profile"
              : "/tutor-dashboard"
            : "/dashboard"
        );
      } else {
        const res = await API.post("/user/signup", form);
        setUser(
          res.data.user.name,
          res.data.access,
          res.data.user.id,
          res.data.user.role
        );
        localStorage.setItem("token", res.data.access);
        localStorage.setItem("role", res.data.user.role);

        navigate(
          res.data.user.role === "tutor"
            ? "/update-tutor-profile"
            : "/dashboard"
        );
      }
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Something went wrong";
      setErrorMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  const handleGoogleSignin = () => {
    window.location.href = `${API.defaults.baseURL}/user/auth/google`;
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden text-white px-4 sm:px-6">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-violet-950 to-neutral-900 animate-gradient-xy"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[400px] sm:w-[500px] md:w-[600px] h-[400px] sm:h-[500px] md:h-[600px] bg-violet-950/40 rounded-full blur-3xl top-10 left-[-150px] animate-burn-slow"></div>
        <div className="absolute w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-slate-800/10 rounded-full blur-3xl bottom-0 right-[-100px] animate-burn-slower"></div>
        <div className="absolute w-[250px] sm:w-[350px] md:w-[400px] h-[250px] sm:h-[350px] md:h-[400px] bg-violet-950/40 rounded-full blur-3xl top-1/3 right-1/3 animate-burn-slowest"></div>
      </div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>

      {/* Auth Card */}
      <motion.div
        layout
        className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md md:w-96 min-h-[460px] sm:min-h-[520px] flex flex-col justify-center"
      >
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6 sm:mb-8 relative">
          <div className="bg-white/10 backdrop-blur-sm rounded-full flex w-56 sm:w-64 p-1 relative overflow-hidden">
            <motion.div
              layout
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-green-600 to-green-700 shadow-lg transition-all duration-500 ${
                isSignin ? "left-1" : "left-[48%]"
              }`}
            />
            <button
              onClick={() => setIsSignin(true)}
              className={`relative z-10 w-1/2 py-2 text-xs sm:text-sm rounded-full font-semibold transition-all ${
                isSignin ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignin(false)}
              className={`relative z-10 w-1/2 py-2 text-xs sm:text-sm rounded-full font-semibold transition-all ${
                !isSignin ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isSignin ? (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-between h-full"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
                  Welcome Back
                </h2>

                {errorMsg && (
                  <div className="mb-4 text-xs sm:text-sm text-red-400 bg-white/5 p-2 rounded text-center">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <input
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition text-sm sm:text-base"
                    placeholder="Email"
                    name="email"
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                  />

                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      name="password"
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition pr-10 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff size={18} />
                      ) : (
                        <HiOutlineEye size={18} />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 transition font-semibold shadow-lg disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </div>

              <div className="mt-5 sm:mt-6">
                <div className="flex items-center justify-center my-3 sm:my-4">
                  <div className="h-[1px] bg-white/20 w-1/3"></div>
                  <span className="text-gray-300 text-xs sm:text-sm mx-2">
                    or
                  </span>
                  <div className="h-[1px] bg-white/20 w-1/3"></div>
                </div>
                <button
                  onClick={handleGoogleSignin}
                  className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-xl bg-white text-gray-800 font-semibold hover:bg-gray-100 transition text-sm sm:text-base"
                >
                  <FcGoogle size={20} /> Sign in with Google
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col justify-between h-full"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
                  Create an Account
                </h2>
                {errorMsg && (
                  <div className="mb-4 text-xs sm:text-sm text-red-400 bg-white/5 p-2 rounded text-center">
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-3 sm:space-y-4">
                  <input
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition text-sm sm:text-base"
                    placeholder="Full Name"
                    name="name"
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                  />
                  <input
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition text-sm sm:text-base"
                    placeholder="Email"
                    name="email"
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      name="password"
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition pr-10 text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff size={18} />
                      ) : (
                        <HiOutlineEye size={18} />
                      )}
                    </button>
                  </div>

                  <label className="flex items-center gap-3 text-xs sm:text-sm text-gray-200 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={form.isTutor}
                        onChange={(e) =>
                          setForm({ ...form, isTutor: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-5 h-5 bg-white/10 backdrop-blur-sm border border-white/30 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-green-600 peer-checked:to-green-700 peer-checked:border-green-500 transition-all duration-300 peer-focus:ring-2 peer-focus:ring-lime-400 peer-focus:ring-offset-2 peer-focus:ring-offset-transparent flex items-center justify-center group-hover:border-white/50">
                        {form.isTutor && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="group-hover:text-white transition-colors">
                      Sign up as Tutor
                    </span>
                  </label>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 transition font-semibold shadow-lg disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? "Signing Up..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        .animate-gradient-xy {
          background-size: 300% 300%;
          animation: gradient-xy 40s ease infinite;
        }
        @keyframes burn {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate(30px, -40px) scale(1.2); opacity: 1; }
        }
        @keyframes burn-slow {
          0%, 100% { transform: translate(-20px, 10px) scale(1); opacity: 0.7; }
          50% { transform: translate(40px, -30px) scale(1.3); opacity: 0.9; }
        }
        .animate-burn-slow { animation: burn 25s ease-in-out infinite alternate; }
        .animate-burn-slower { animation: burn-slow 40s ease-in-out infinite alternate; }
        .animate-burn-slowest { animation: burn 60s ease-in-out infinite alternate; }
      `}</style>
    </div>
  );
}
