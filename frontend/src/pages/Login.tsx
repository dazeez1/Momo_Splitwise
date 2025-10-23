import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Users, Mail, Lock, ArrowLeft } from "lucide-react";
import { authAPI } from "../services/api";

interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      console.log("Login data:", data);

      // Call the real API
      const response = await authAPI.login({
        email: data.email,
        password: data.password,
      });

      if (response.success) {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Invalid email or password. Please check your credentials and try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">
            <Users size={32} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your MoMo Split account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group full-width">
            <label className="form-label">
              <Mail
                size={16}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Email Address *
            </label>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="Enter your email address"
              type="email"
              autoComplete="email"
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              <Lock
                size={16}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              Password *
            </label>
            <div className="password-container">
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                {...register("rememberMe")}
                type="checkbox"
                className="checkbox-input"
              />
              <span className="checkbox-label">Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? <span className="loading"></span> : "Sign In"}
          </button>

          <div className="auth-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </form>

        <div className="auth-footer">
          © 2025 MoMo Split. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
