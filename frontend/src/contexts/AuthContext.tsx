import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { User, RegistrationData } from "../types";
import apiService from "../services/apiService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Helper function to transform MongoDB user to frontend format
const transformUser = (user: any): User => {
  if (!user) return user;
  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    mobileMoneyNumber: user.mobileMoneyNumber,
    mobileMoneyProvider: user.mobileMoneyProvider,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
  };
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload ? transformUser(action.payload) : null,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };
    case "LOGIN":
      return {
        ...state,
        user: transformUser(action.payload),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (userData: RegistrationData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const user = await apiService.getCurrentUser();
          dispatch({ type: "SET_USER", payload: user });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear tokens if the auth check fails
        apiService.clearTokensFromStorage();
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (
    identifier: string,
    password: string
  ): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const response = await apiService.login({ identifier, password });
      dispatch({ type: "LOGIN", payload: response.user });
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch({ type: "SET_ERROR", payload: error.message || "Login failed" });
      return false;
    }
  };

  const register = async (userData: RegistrationData): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const response = await apiService.register({
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
      });

      dispatch({ type: "LOGIN", payload: response.user });
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Registration failed",
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!state.user) return false;

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const updatedUser = await apiService.updateProfile(userData);
      console.log("Updated user from API:", updatedUser);
      const transformedUser = transformUser(updatedUser);
      console.log("Transformed user:", transformedUser);
      dispatch({ type: "SET_USER", payload: transformedUser });
      return true;
    } catch (error: any) {
      console.error("Profile update error:", error);
      dispatch({
        type: "SET_ERROR",
        payload: error.message || "Profile update failed",
      });
      return false;
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
