import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // LOGIN USING EMAIL + PASSWORD WITH fetch()
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("https://api.nextkinlife.live/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("LOGIN RESPONSE:", data);

            if (data.token) {
                localStorage.setItem("admin-auth", data.token);
                navigate("/dashboard");
            } else {
                alert(data.message || "Invalid admin credentials!");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login failed");
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

                                <div className="flex items-center bg-white border border-gray-300 rounded-lg 
                                    focus-within:border-[#cb2926] focus-within:ring-2 
                                    focus-within:ring-[#cb2926] overflow-hidden transition-all">

                                    <div className="bg-gray-100 p-3 border-r border-gray-300">
                                        <Lock className="text-gray-600" size={20} />
                                    </div>

                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        required
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex-1 p-3 outline-none text-gray-900 bg-white"
                                        placeholder="Enter your password"
                                    />

                                    <div
                                        onClick={() => setShowPass(!showPass)}
                                        className="px-3 cursor-pointer text-gray-600 hover:text-[#cb2926]"
                                    >
                                        {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </div>
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