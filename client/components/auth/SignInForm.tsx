"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInFormData } from "@/lib/validations/auth";
import axios from "axios";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function SignInForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const api = axios.create({
    baseURL: "https://realtime-workspace-1.onrender.com/api",
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await api.post("/auth/login", {
        email: data?.email,
        password: data?.password,
      });

      localStorage.setItem("token", response.data.token);

      router.push("/dashboard");
    } catch (err: any) {
      console.log(err.response?.data?.message);
    }
  };

  const [showPassword, setShowPassword] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Heading */}
        <h2 className="text-2xl font-semibold text-white text-center">
          Welcome back 👋
        </h2>
        <p className="text-sm text-gray-400 text-center mt-1 mb-6">
          Login to continue your workspace
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Button */}
          <button
            type="submit"
            className="w-full py-2.5 mt-2 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 transition-all duration-200 shadow-lg shadow-purple-600/20">
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/sign-up")}
            className="text-purple-400 hover:underline cursor-pointer">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
