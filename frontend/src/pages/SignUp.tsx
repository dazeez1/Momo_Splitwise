import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Users } from "lucide-react";
import { authAPI } from "../services/api";

interface SignUpForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>();

  const password = watch("password");

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true);
    try {
      console.log("Signup data:", data);

      // Call the real API
      const response = await authAPI.signup({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
      });

      if (response.success) {
        toast.success("Account created successfully!");
        navigate("/login");
      } else {
        toast.error(response.message || "Failed to create account");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create account. Please try again.";
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
          <h1 className="auth-title">Join MoMo Split</h1>
          <p className="auth-subtitle">
            Create an account to start splitting expenses with friends
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                {...register("firstName", {
                  required: "First name is required",
                })}
                className={`form-input ${errors.firstName ? "error" : ""}`}
                placeholder="First Name"
                type="text"
              />
              {errors.firstName && (
                <span className="form-error">{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                {...register("lastName", { required: "Last name is required" })}
                className={`form-input ${errors.lastName ? "error" : ""}`}
                placeholder="Last Name"
                type="text"
              />
              {errors.lastName && (
                <span className="form-error">{errors.lastName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                  maxLength: {
                    value: 30,
                    message: "Username must be less than 30 characters",
                  },
                })}
                className={`form-input ${errors.username ? "error" : ""}`}
                placeholder="Username *"
                type="text"
              />
              {errors.username && (
                <span className="form-error">{errors.username.message}</span>
              )}
              <span className="form-help">
                Username must be 3-30 characters long
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="Email Address *"
                type="email"
              />
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="password-container">
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    pattern: {
                      value: /^(?=.*\d).{6,}$/,
                      message: "Password must contain at least one number",
                    },
                  })}
                  className={`form-input ${errors.password ? "error" : ""}`}
                  placeholder="Password *"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
              <span className="form-help">
                At least 6 characters with a number
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="password-container">
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                  placeholder="Confirm Password *"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="form-error">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? <span className="loading"></span> : "Create Account"}
          </button>

          <div className="auth-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </form>

        <div className="auth-footer">
          © 2025 MoMo Split. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default SignUp;
