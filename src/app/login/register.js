"use client";

import { useState } from "react";
import Image from "next/image";
import { signup as signupApi } from "../config";

const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
];

export default function Register({ onLoginClick }) {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(signupApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Registration failed");
      }
      setSuccess("Registration successful! You can now log in.");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

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
            className="drop-shadow-xl"
          />
        </div>
        {/* Register Card */}
        <div className="flex-1 max-w-md w-full bg-white rounded-xl shadow-lg p-8 mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2 text-black">Create Account</h2>
          <p className="text-center text-gray-700 mb-6 text-sm">
            Sign up to get started with your AI Chat account
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-800" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                value={form.role}
                onChange={handleChange}
              >
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm text-center">{success}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md py-2 transition-colors"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-700">
            Already have an account?{' '}
            <button
              className="text-gray-800 hover:underline font-medium bg-transparent border-none p-0"
              onClick={onLoginClick}
              type="button"
            >
              Log in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
