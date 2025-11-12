import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import "../App.css";

export default function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [role, setRole] = useState("");

  const onSubmit = async (data) => {
    data.role = role; // include role in submission
    try {
      setLoading(true);
      setServerError("");

      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const msg = body.detail || body.message || "Signup failed";
        setServerError(msg);
        return;
      }

      console.log("Successfully registered!");
      alert(body.message || "Registration successful!");
    } catch (err) {
      console.error("Registration failed:", err);
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl px-8 py-10">
        <h1 className="text-3xl font-semibold text-center mb-2">Create account</h1>
        <p className="text-sm text-slate-400 text-center mb-8">
          Join{" "}
          <span className="font-semibold text-indigo-400">Panel Verse</span> and
          start sharing your comics.
        </p>

        {serverError && (
          <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-500/40 rounded-lg px-3 py-2">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              {...register("name", { required: "Name is required" })}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={{ textAlign: "left" }} className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email", { required: "Email is required" })}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              style={{ textAlign: "left" }}
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register("password", { required: "Password is required" })}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

         {/* Role selection */}
         <div className="pt-2">
           <p className="text-sm font-medium mb-2 text-center text-slate-300">
             I am a...
           </p>
           <div className="flex justify-center gap-4">
             <button
               type="button"
               onClick={() => setRole("artist")}
               className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                 role === "artist"
                   ? "bg-indigo-600 border-indigo-500 text-white"
                   : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
               }`}
             >
               Artist
             </button>
 
             <button
               type="button"
               onClick={() => setRole("viewer")}
               className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                 role === "viewer"
                   ? "bg-indigo-600 border-indigo-500 text-white"
                   : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
               }`}
             >
               Viewer
             </button>
           </div>
 
           {!role && (
             <p className="mt-1 text-xs text-center text-red-400">
               Please select your role.
             </p>
           )}
         </div>     

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Signing up…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
