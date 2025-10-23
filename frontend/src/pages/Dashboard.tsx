import { Link } from "react-router-dom";
import {
  Users,
  Plus,
  LogOut,
  CreditCard,
  TrendingUp,
  Settings,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="App">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">
            <Users size={32} />
          </div>
          <h1 className="auth-title">Welcome to MoMo Split!</h1>
          <p className="auth-subtitle">
            Manage your expense groups and track shared costs
          </p>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">0</div>
                <div className="stat-label">Groups</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CreditCard size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">$0.00</div>
                <div className="stat-label">Total Expenses</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-number">0</div>
                <div className="stat-label">Active Splits</div>
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="action-button primary">
              <Plus size={20} style={{ marginRight: "8px" }} />
              Create New Group
            </button>

            <button className="action-button secondary">
              <Settings size={20} style={{ marginRight: "8px" }} />
              Settings
            </button>
          </div>

          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-empty">
              <Users
                size={48}
                style={{ color: "#9ca3af", marginBottom: "16px" }}
              />
              <p>No recent activity</p>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Create your first expense group to get started!
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link
            to="/login"
            style={{ color: "#10b981", textDecoration: "none" }}
          >
            <LogOut
              size={20}
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            />
            Logout
          </Link>
        </div>

        <div className="auth-footer">
          © 2025 MoMo Split. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
