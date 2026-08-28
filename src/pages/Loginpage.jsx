import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import axios from "axios";
import { useAdmin } from "../context/AdminContext";
import { supabase } from "../lib/supabase";

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.nextkinlife.live";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { setAdmin } = useAdmin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Try Supabase Auth First
            if (supabase) {
                try {
                    const { data: supaAuthData, error: supaError } = await supabase.auth.signInWithPassword({
                        email: email.trim(),
                        password: password.trim(),
                    });

                    if (!supaError && supaAuthData?.session) {
                        const user = supaAuthData.user;
                        const session = supaAuthData.session;

                        // Query profile for role
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("*")
                            .eq("email", email.trim())
                            .maybeSingle();

                        const role = profile?.role || user.user_metadata?.role || "super_admin";
                        const adminData = profile || {
                            id: user.id,
                            email: user.email,
                            name: user.user_metadata?.name || "Admin",
                            role,
                        };

                        localStorage.setItem("admin-logged-in", "true");
                        localStorage.setItem("admin-auth", session.access_token);
                        localStorage.setItem("admin-role", role);

                        setAdmin(adminData);

                        if (role === "recruiter") {
                            navigate("/dashboard/career");
                        } else {
                            navigate("/dashboard");
                        }
                        setLoading(false);
                        return;
                    }
                } catch (supaEx) {
                    console.warn("Supabase direct auth attempt, falling back to API:", supaEx);
                }
            }

            // 2. Fallback to API Endpoint (without withCredentials to avoid CORS wildcard block)
            const response = await axios.post(`${BASE_URL}/admin/login`, {
                email,
                password
            }, {
                headers: { "Content-Type": "application/json" }
            });

            const data = response.data;

            if (data.success) {
                localStorage.setItem("admin-logged-in", "true");
                if (data.token) {
                    localStorage.setItem("admin-auth", data.token);
                }

                const adminData = data.data || data.admin || {};
                const role = adminData.role || "admin";
                localStorage.setItem("admin-role", role);

                setAdmin(adminData);

                if (role === "recruiter") {
                    navigate("/dashboard/career");
                } else {
                    navigate("/dashboard");
                }
            } else {
                alert(data.message || "Invalid admin credentials!");
            }
        } catch (error) {
            console.error("Login Error:", error);
            const errMsg = error.response?.data?.message || error.message || "Login failed";
            alert(errMsg);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full bg-[#cb2926] flex items-center justify-center p-4">

            {/* CARD WRAPPER */}
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex overflow-hidden transform transition-all duration-300 hover:scale-[1.01] animate-fadeIn">

                {/* LEFT SIDE */}
                <div className="w-1/2 hidden md:flex flex-col items-center justify-center px-10 py-16 
                    bg-gradient-to-b from-[#00162d] to-[#012c50] space-y-10 text-white">

                    <img
                        src="/nextkinlife-logo.jpeg"
                        alt="Logo"
                        className="w-28 h-24 object-contain drop-shadow-xl"
                    />

                    <div className="w-60 h-60 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                        <img
                            src="/image.png"
                            alt="Login Illustration"
                            className="w-full h-full object-contain rounded-xl"
                        />
                    </div>

                    <h1 className="text-3xl font-extrabold tracking-wide text-center">
                        Welcome Admin
                    </h1>

                    <p className="text-sm opacity-90 text-center leading-relaxed max-w-xs">
                        Access your admin dashboard and manage the entire system efficiently.
                    </p>
                </div>

                {/* RIGHT SIDE — FORM */}
                <div className="w-full md:w-1/2 bg-white p-12 flex flex-col justify-center">

                    <h2 className="text-4xl font-extrabold mb-10 text-center text-[#002a4d]">
                        Admin Login
                    </h2>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-inner">

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* EMAIL */}
                            <div className="flex flex-col space-y-2">
                                <label className="text-gray-700 font-semibold text-sm tracking-wide">
                                    Email Address
                                </label>

                                <div className="flex items-center bg-white border border-gray-300 rounded-lg 
                                    focus-within:border-[#cb2926] focus-within:ring-2 
                                    focus-within:ring-[#cb2926] overflow-hidden transition-all">

                                    <div className="bg-gray-100 p-3 border-r border-gray-300">
                                        <Mail className="text-gray-600" size={20} />
                                    </div>

                                    <input
                                        type="email"
                                        value={email}
                                        required
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="username"
                                        className="flex-1 p-3 outline-none text-gray-900 bg-white"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div className="flex flex-col space-y-2">
                                <label className="text-gray-700 font-semibold text-sm tracking-wide">
                                    Password
                                </label>

                                <div
                                    className="relative flex items-center bg-white border border-gray-300 rounded-lg 
    focus-within:border-[#cb2926] focus-within:ring-2 focus-within:ring-[#cb2926] 
    overflow-hidden transition-all"
                                >
                                    <div className="bg-gray-100 p-3 border-r border-gray-300">
                                        <Lock className="text-gray-600" size={20} />
                                    </div>

                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        required
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        className="flex-1 p-3 outline-none text-gray-900 bg-white pr-12"
                                        placeholder="Enter your password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 text-gray-600 hover:text-[#cb2926]"
                                    >
                                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            {/* LOGIN BUTTON */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#cb2926] hover:bg-[#a71f1c] text-white font-semibold 
                                    p-3 rounded-lg shadow-lg flex items-center justify-center 
                                    transition-all disabled:bg-opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin mr-2" />
                                        Logging in...
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </form>

                    </div>

                </div>

            </div>
        </div>
    );
}