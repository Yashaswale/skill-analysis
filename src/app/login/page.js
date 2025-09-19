"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginApi, forgotPassword as forgotPasswordApi } from "../config";
import Register from "./register";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(loginApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error("Invalid email or password");
      }
      const data = await res.json();
      // Set localStorage with expiry (default 12 hours)
      const twelveHoursMs = 12 * 60 * 60 * 1000;
      const expiresAt = Date.now() + twelveHoursMs;
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessTokenExpiry", String(expiresAt));

      // Also drop an http cookie accessible to middleware (non-HttpOnly since set client-side)
      // Note: Max-Age is in seconds
      document.cookie = `authToken=${encodeURIComponent(
        data.accessToken
      )}; Max-Age=${Math.floor(twelveHoursMs / 1000)}; Path=/`;
      document.cookie = `authExpiry=${expiresAt}; Max-Age=${Math.floor(
        twelveHoursMs / 1000
      )}; Path=/`;
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg("");
    try {
      const res = await fetch(forgotPasswordApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!res.ok) throw new Error("Failed to send reset link");
      setForgotMsg("A reset password link has been sent to your registered email.");
    } catch (err) {
      setForgotMsg(err.message || "Failed to send reset link");
    } finally {
      setForgotLoading(false);
      setShowForgotModal(true);
    }
  };

  if (showRegister) {
    return <Register onLoginClick={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f6fd]">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-5xl mx-auto p-4">
        {/* Robot Image */}
        <div className="flex-1 flex items-center justify-center mb-8 md:mb-0">
          <Image
            src="/login_robo.png"
            alt="Login Robot"
            width={350}
            height={350}
            priority
            unoptimized
            className="drop-shadow-xl"
          />
        </div>
        {/* Login or Forgot Password Form */}
        <div className="flex-1 max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          {!showForgot ? (
            <>
              <h2 className="text-2xl font-bold text-center mb-2 text-black">Welcome Back</h2>
              <p className="text-center text-gray-700 mb-6 text-sm">
                Sign in to your AI Chat account to continue your conversation
              </p>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter a secure password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="mr-2 accent-blue-600"
                    />
                    <label htmlFor="remember" className="text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-gray-800 hover:underline bg-transparent border-none p-0"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotEmail("");
                      setForgotMsg("");
                    }}
                  >
                    Forget password ?
                  </button>
                </div>
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-700">
                Don&apos;t have an account?{' '}
                <button
                  className="text-gray-800 hover:underline font-medium bg-transparent border-none p-0"
                  onClick={() => setShowRegister(true)}
                >
                  Sign up here
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center mb-2 text-black">Reset Password</h2>
              <p className="text-center text-gray-700 mb-6 text-sm">
                Enter your email to receive a password reset link
              </p>
              <form className="space-y-4" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800" htmlFor="forgotEmail">
                    Email address
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 transition-colors"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending..." : "Send Reset Link"}
                </button>
                <button
                  type="button"
                  className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md py-2 transition-colors"
                  onClick={() => setShowForgot(false)}
                >
                  Back to login
                </button>
              </form>
            </>
          )}
          {/* Forgot Password Confirmation Modal */}
          {showForgotModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-30 z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full relative">
                <button
                  className="absolute top-2 right-2 text-gray-500"
                  onClick={() => setShowForgotModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-xl font-bold text-center mb-2 text-black">Reset Password</h2>
                <p className="text-center text-gray-700 mb-6 text-sm">
                  {forgotMsg}
                </p>
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 transition-colors"
                  onClick={() => {
                    setShowForgotModal(false);
                    setShowForgot(false);
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
