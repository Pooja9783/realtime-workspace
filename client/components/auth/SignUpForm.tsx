"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpFormData } from "@/lib/validations/auth";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SignUpForm() {
  const router = useRouter();

  const api = axios.create({
    baseURL: "https://realtime-workspace-1.onrender.com/api",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const res = await api.post("/auth/signup", {
        name: data.username,
        email: data.email,
        password: data.password,
      });

      console.log(res);
      router.push("/sign-in");
    } catch {
      console.log("error");
    }
  };

  const [showPassword, setShowPassword] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Heading */}
        <h2 className="text-2xl font-semibold text-white text-center">
          Create your account ✨
        </h2>
        <p className="text-sm text-gray-400 text-center mt-1 mb-6">
          Start collaborating in real-time
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs text-gray-400">Username</label>
            <input
              type="text"
              placeholder="john_doe"
              {...register("username")}
              className="mt-1 w-full px-4 py-2.5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            {errors.username && (
              <p className="text-xs text-red-400 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-gray-400">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className="mt-1 w-full px-4 py-2.5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-gray-400">Password</label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-red-400 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs text-gray-400">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="mt-1 w-full px-4 py-2.5 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full py-2.5 mt-2 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition-all duration-200 shadow-lg shadow-purple-600/20">
            Create Account
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/sign-in")}
            className="text-purple-400 hover:underline cursor-pointer">
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
