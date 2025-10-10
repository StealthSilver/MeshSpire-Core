import { useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isSignin, setIsSignin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatarUrl: "",
  });

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
        localStorage.setItem("token", res.data.access);
        navigate("/dashboard");
      } else {
        const res = await API.post("/user/signup", form);
        localStorage.setItem("token", res.data.token);
        setIsSignin(true);
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

  const handleGoogleSignin = () => {
    window.location.href = `${API.defaults.baseURL}/user/auth/google`;
  };

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-purple-700 to-neutral-900 animate-gradient-xy"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-purple-800/20 rounded-full blur-3xl top-10 left-[-200px] animate-burn-slow"></div>
        <div className="absolute w-[500px] h-[500px] bg-slate-800/10 rounded-full blur-3xl bottom-0 right-[-150px] animate-burn-slower"></div>
        <div className="absolute w-[400px] h-[400px] bg-purple-800/20 rounded-full blur-3xl top-1/3 right-1/3 animate-burn-slowest"></div>
      </div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>

      <motion.div
        layout
        className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 w-96 min-h-[520px] flex flex-col justify-center"
      >
        <div className="flex justify-center mb-8 relative">
          <div className="bg-white/10 backdrop-blur-sm rounded-full flex w-64 p-1 relative overflow-hidden">
            <motion.div
              layout
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-green-600 to-green-700 shadow-lg transition-all duration-500 ${
                isSignin ? "left-1" : "left-[48%]"
              }`}
            />
            <button
              onClick={() => setIsSignin(true)}
              className={`relative z-10 w-1/2 py-2 rounded-full text-sm font-semibold transition-all ${
                isSignin ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignin(false)}
              className={`relative z-10 w-1/2 py-2 rounded-full text-sm font-semibold transition-all ${
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
                <h2 className="text-3xl font-bold text-center mb-6">
                  Welcome Back
                </h2>

                {errorMsg && (
                  <div className="mb-4 text-sm text-red-400 bg-white/5 p-2 rounded text-center">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition"
                    placeholder="Email"
                    name="email"
                    onChange={handleChange}
                  />

                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      name="password"
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff size={20} />
                      ) : (
                        <HiOutlineEye size={20} />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 transition font-semibold shadow-lg disabled:opacity-50"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-center my-4">
                  <div className="h-[1px] bg-white/20 w-1/3"></div>
                  <span className="text-gray-300 text-sm mx-2">or</span>
                  <div className="h-[1px] bg-white/20 w-1/3"></div>
                </div>
                <button
                  onClick={handleGoogleSignin}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-gray-800 font-semibold hover:bg-gray-100 transition"
                >
                  <FcGoogle size={22} /> Sign in with Google
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
                <h2 className="text-3xl font-bold text-center mb-6">
                  Create an Account
                </h2>

                <div className="space-y-4">
                  <input
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition"
                    placeholder="Full Name"
                    name="name"
                    onChange={handleChange}
                  />
                  <input
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition"
                    placeholder="Email"
                    name="email"
                    onChange={handleChange}
                  />
                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      name="password"
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                    >
                      {showPassword ? (
                        <HiOutlineEyeOff size={20} />
                      ) : (
                        <HiOutlineEye size={20} />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 transition font-semibold shadow-lg disabled:opacity-50"
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
