import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import API from "../api";
import { useAuth } from "../Context/AuthContext";

interface SigninForm {
  email: string;
  password: string;
}

interface SigninResponse {
  access: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export default function Signin() {
  const [form, setForm] = useState<SigninForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await API.post<SigninResponse>("/user/signin", form);
      const userId = res.data.user.id;
      setUser(res.data.user.name, res.data.access, userId);
      navigate("/dashboard");
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Signin failed";
      setErrorMsg(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-purple-800 to-neutral-900 animate-gradient-xy"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-3xl top-10 left-[-200px] animate-burn-slow"></div>
        <div className="absolute w-[500px] h-[500px] bg-green-500/10 rounded-full blur-3xl bottom-0 right-[-150px] animate-burn-slower"></div>
        <div className="absolute w-[400px] h-[400px] bg-purple-700/20 rounded-full blur-3xl top-1/3 right-1/3 animate-burn-slowest"></div>
      </div>

      <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>

      <div className="relative z-10 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 w-96">
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full flex w-64 p-1">
            <button
              disabled
              className="w-1/2 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-600 to-green-700 shadow-lg cursor-default"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-1/2 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-white/20"
            >
              Sign Up
            </button>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>

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
            value={form.email}
            onChange={handleChange}
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 bg-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 placeholder-gray-300 transition pr-10"
              placeholder="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
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

        <p className="text-sm mt-6 text-gray-300 text-center">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-lime-400 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>

      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
        .animate-gradient-xy {
          background-size: 300% 300%;
          animation: gradient-xy 40s ease infinite; /* very slow and smooth */
        }

        /* Chemical burn blob motion */
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
