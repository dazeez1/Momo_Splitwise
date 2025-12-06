// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/**
 * API Service for handling all backend communication
 * Replaces localStorage with real API calls
 */
class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
  }

  /**
   * Load tokens from localStorage on initialization
   */
  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem("momo-splitwise-access-token");
    this.refreshToken = localStorage.getItem("momo-splitwise-refresh-token");
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokensToStorage(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem("momo-splitwise-access-token", accessToken);
    localStorage.setItem("momo-splitwise-refresh-token", refreshToken);
  }

  /**
   * Clear tokens from localStorage
   */
  clearTokensFromStorage(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem("momo-splitwise-access-token");
    localStorage.removeItem("momo-splitwise-refresh-token");
  }

  /**
   * Make HTTP request with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    if (this.accessToken) {
      defaultHeaders["Authorization"] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);

        // Handle rate limiting
        if (response.status === 429) {
          throw new Error(
            "Too many requests. Please wait a moment and try again."
          );
        }

        data = { message: text || "Request failed" };
      }

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request with new token
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${this.accessToken}`,
            };
            const retryResponse = await fetch(url, config);

            if (contentType && contentType.includes("application/json")) {
              const retryData = await retryResponse.json();
              if (!retryResponse.ok) {
                throw new Error(retryData.message || "Request failed");
              }
              return retryData;
            } else {
              const retryText = await retryResponse.text();
              if (!retryResponse.ok) {
                throw new Error(retryText || "Request failed");
              }
              return { message: retryText } as T;
            }
          }
        }

        // Log the full error response for debugging
        console.error("API Error Response:", data);

        // Handle validation errors specifically
        if (data && data.code === "VALIDATION_ERROR" && data.errors) {
          const errorMessages = data.errors
            .map((error: any) => error.message)
            .join(", ");
          throw new Error(errorMessages);
        }

        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.saveTokensToStorage(
          data.data.tokens.accessToken,
          data.data.tokens.refreshToken
        );
        return true;
      } else {
        this.clearTokensFromStorage();
        return false;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearTokensFromStorage();
      return false;
    }
  }

  // Authentication Methods

  /**
   * Register a new user
   */
  async register(userData: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }): Promise<{
    user: any;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    console.log("Registering user with data:", userData);

    const response = await this.makeRequest<{
      success: boolean;
      message: string;
      data: {
        user: any;
        tokens: { accessToken: string; refreshToken: string };
      };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success) {
      this.saveTokensToStorage(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      return response.data;
    }

    throw new Error(response.message);
  }

  /**
   * Login user
   */
  async login(credentials: {
    identifier: string; // email or phone
    password: string;
  }): Promise<{
    user: any;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
      data: {
        user: any;
        tokens: { accessToken: string; refreshToken: string };
      };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success) {
      this.saveTokensToStorage(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      return response.data;
    }

    throw new Error(response.message);
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.makeRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokensFromStorage();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<any> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
      data: { user: any };
    }>("/auth/me");

    if (response.success) {
      return response.data.user;
    }

    throw new Error(response.message);
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: {
    name?: string;
    phoneNumber?: string;
    profilePicture?: string;
    preferences?: {
      currency?: string;
      language?: string;
      notifications?: {
        email?: boolean;
        sms?: boolean;
        push?: boolean;
      };
    };
  }): Promise<any> {
    const response = await this.makeRequest<{
      success: boolean;
      message: string;
      data: { user: any };
    }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });

    if (response.success) {
      return response.data.user;
    }

    throw new Error(response.message);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // User Methods

  /**
   * Get all users
   */
  async getUsers(): Promise<{ users: any[] }> {
    return this.makeRequest("/users");
  }

  // Group Methods

  /**
   * Get all groups for the current user
   */
  async getGroups(): Promise<{ groups: any[] }> {
    return this.makeRequest("/groups");
  }

  /**
   * Get a single group by ID
   */
  async getGroupById(groupId: string): Promise<{ group: any }> {
    return this.makeRequest(`/groups/${groupId}`);
  }

  /**
   * Create a new group
   */
  async createGroup(groupData: {
    name: string;
    description?: string;
    members: string[];
    currency?: string;
    color?: string;
  }): Promise<{ group: any }> {
    return this.makeRequest("/groups", {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  }

  /**
   * Update a group
   */
  async updateGroup(
    groupId: string,
    groupData: {
      name?: string;
      description?: string;
      members?: string[];
      currency?: string;
      color?: string;
    }
  ): Promise<{ group: any }> {
    return this.makeRequest(`/groups/${groupId}`, {
      method: "PUT",
      body: JSON.stringify(groupData),
    });
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupId: string): Promise<{ message: string }> {
    return this.makeRequest(`/groups/${groupId}`, {
      method: "DELETE",
    });
  }

  /**
   * Add a member to a group
   */
  async addGroupMember(
    groupId: string,
    memberId: string
  ): Promise<{ group: any }> {
    return this.makeRequest(`/groups/${groupId}/members`, {
      method: "POST",
      body: JSON.stringify({ memberId }),
    });
  }

  /**
   * Remove a member from a group
   */
  async removeGroupMember(
    groupId: string,
    memberId: string
  ): Promise<{ group: any }> {
    return this.makeRequest(`/groups/${groupId}/members/${memberId}`, {
      method: "DELETE",
    });
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // Expense Methods

  /**
   * Get all expenses for the current user
   */
  async getExpenses(): Promise<{ expenses: any[] }> {
    return this.makeRequest("/expenses");
  }

  /**
   * Get expenses for a specific group
   */
  async getGroupExpenses(groupId: string): Promise<{ expenses: any[] }> {
    return this.makeRequest(`/expenses/group/${groupId}`);
  }

  /**
   * Get a single expense by ID
   */
  async getExpenseById(expenseId: string): Promise<{ expense: any }> {
    return this.makeRequest(`/expenses/${expenseId}`);
  }

  /**
   * Create a new expense
   */
  async createExpense(expenseData: {
    description: string;
    amount: number;
    currency: string;
    category: string;
    groupId: string;
    splitType: "equal" | "percentage" | "exact";
    splits: Array<{ userId: string; amount?: number; percentage?: number }>;
    paidBy?: string;
  }): Promise<{ expense: any }> {
    return this.makeRequest("/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    });
  }

  /**
   * Update an expense
   */
  async updateExpense(
    expenseId: string,
    expenseData: {
      description?: string;
      amount?: number;
      currency?: string;
      category?: string;
      splitType?: "equal" | "percentage" | "exact";
      splits?: Array<{ userId: string; amount?: number; percentage?: number }>;
      paidBy?: string;
    }
  ): Promise<{ expense: any }> {
    return this.makeRequest(`/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify(expenseData),
    });
  }

  /**
   * Delete an expense
   */
  async deleteExpense(expenseId: string): Promise<{ message: string }> {
    return this.makeRequest(`/expenses/${expenseId}`, {
      method: "DELETE",
    });
  }

  // Payment Methods

  /**
   * Get all payments for the current user
   */
  async getPayments(): Promise<{ payments: any[] }> {
    return this.makeRequest("/payments");
  }

  /**
   * Get a single payment by ID
   */
  async getPaymentById(paymentId: string): Promise<{ payment: any }> {
    return this.makeRequest(`/payments/${paymentId}`);
  }

  /**
   * Create a new payment
   */
  async createPayment(paymentData: {
    toUserId: string;
    amount: number;
    currency: string;
    description?: string;
    groupId?: string;
    type?: "settlement" | "request" | "direct_payment";
    paymentMethod?: "mobile_money" | "bank_transfer" | "cash" | "other";
  }): Promise<{ payment: any }> {
    return this.makeRequest("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status:
      | "pending"
      | "sent"
      | "received"
      | "completed"
      | "failed"
      | "cancelled"
  ): Promise<{ payment: any }> {
    return this.makeRequest(`/payments/${paymentId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Delete a payment
   */
  async deletePayment(paymentId: string): Promise<{ message: string }> {
    return this.makeRequest(`/payments/${paymentId}`, {
      method: "DELETE",
    });
  }

  // Balance Methods

  /**
   * Get balances for a specific group
   */
  async getGroupBalances(groupId: string): Promise<{ balances: any[] }> {
    const response = await this.makeRequest<{ balances?: any[]; data?: { balances: any[] } }>(`/balances/group/${groupId}`);
    return (response as any).data || response as { balances: any[] };
  }

  /**
   * Get simplified debts for a specific group
   */
  async getSimplifiedDebts(groupId: string): Promise<{ debts: any[] }> {
    const response = await this.makeRequest<{ debts?: any[]; data?: { debts: any[] } }>(
      `/balances/group/${groupId}/simplify`
    );
    return (response as any).data || response as { debts: any[] };
  }

  // Invitation Methods

  /**
   * Get all pending invitations for the current user
   */
  async getInvitations(): Promise<{ invitations: any[] }> {
    return this.makeRequest("/invitations");
  }

  /**
   * Get a single invitation by ID
   */
  async getInvitationById(invitationId: string): Promise<{ invitation: any }> {
    return this.makeRequest(`/invitations/${invitationId}`);
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(
    invitationId: string
  ): Promise<{ group: any; invitation: any }> {
    return this.makeRequest(`/invitations/${invitationId}/accept`, {
      method: "PUT",
    });
  }

  /**
   * Decline an invitation
   */
  async declineInvitation(invitationId: string): Promise<{ message: string }> {
    return this.makeRequest(`/invitations/${invitationId}/decline`, {
      method: "PUT",
    });
  }

  /**
   * Delete/Cancel an invitation
   */
  async deleteInvitation(invitationId: string): Promise<{ message: string }> {
    return this.makeRequest(`/invitations/${invitationId}`, {
      method: "DELETE",
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
