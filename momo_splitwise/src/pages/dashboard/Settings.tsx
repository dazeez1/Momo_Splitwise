import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  Sun, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  Download, 
  Upload,
  Database
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useApp } from "../../contexts/AppContext";

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { groups, expenses, users, resetToDemoData, clearAllData } = useApp();
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [settings, setSettings] = useState({
    // General Settings
    language: "en",
    currency: "RWF",
    timezone: "Africa/Kigali",

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    paymentReminders: true,
    expenseUpdates: true,

    // Privacy Settings
    profileVisibility: "friends",
    expenseVisibility: "group",
    allowFriendRequests: true,

    // Appearance
    theme: "light",
    compactView: false,
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    // In a real app, save to backend
  };

  const handleResetToDemo = async () => {
    setIsResetting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      resetToDemoData();
      alert('Demo data has been loaded successfully!');
    } catch (error) {
      alert('Failed to reset data. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      clearAllData();
      alert('All data has been cleared successfully!');
    } catch (error) {
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      users,
      groups,
      expenses,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `momo-splitwise-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.users && data.groups && data.expenses) {
          if (window.confirm('This will replace all your current data. Are you sure?')) {
            localStorage.setItem('momo-splitwise-users', JSON.stringify(data.users));
            localStorage.setItem('momo-splitwise-groups', JSON.stringify(data.groups));
            localStorage.setItem('momo-splitwise-expenses', JSON.stringify(data.expenses));
            window.location.reload();
          }
        } else {
          alert('Invalid backup file format.');
        }
      } catch (error) {
        alert('Error reading backup file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const tabs = [
    { id: "general", name: "General", icon: SettingsIcon },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "privacy", name: "Privacy", icon: Shield },
    { id: "appearance", name: "Appearance", icon: Globe },
    { id: "data", name: "Data Management", icon: Database },
  ];

  const renderSettingsContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
                  >
                    <option value="RWF">Rwandan Francs (RWF)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        timezone: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
                  >
                    <option value="Africa/Kigali">Central Africa Time (Kigali)</option>
                    <option value="Africa/Nairobi">East Africa Time (Nairobi)</option>
                    <option value="Africa/Lagos">West Africa Time (Lagos)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notification Preferences
            </h3>

            <div className="space-y-4">
              {[
                {
                  key: "emailNotifications",
                  label: "Email Notifications",
                  description: "Receive updates via email",
                },
                {
                  key: "pushNotifications",
                  label: "Push Notifications",
                  description: "Receive browser notifications",
                },
                {
                  key: "paymentReminders",
                  label: "Payment Reminders",
                  description: "Get reminded about pending payments",
                },
                {
                  key: "expenseUpdates",
                  label: "Expense Updates",
                  description: "Notify when expenses are added or modified",
                },
              ].map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500">{description}</div>
                  </div>
                  <button
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof settings],
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 ${
                      settings[key as keyof typeof settings]
                        ? "bg-yellow-600"
                        : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings[key as keyof typeof settings]
                          ? "translate-x-5"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Privacy Settings
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Visibility
                </label>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      profileVisibility: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Visibility
                </label>
                <select
                  value={settings.expenseVisibility}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      expenseVisibility: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200"
                >
                  <option value="public">Public</option>
                  <option value="group">Group Members Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    Allow Friend Requests
                  </div>
                  <div className="text-sm text-gray-500">
                    Let other users send you friend requests
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      allowFriendRequests: !prev.allowFriendRequests,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 ${
                    settings.allowFriendRequests
                      ? "bg-yellow-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.allowFriendRequests
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Appearance
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Theme
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, theme: "light" }))
                    }
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      settings.theme === "light"
                        ? "border-yellow-600 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Sun className="h-6 w-6 mb-2 text-gray-600" />
                    <div className="font-medium text-gray-900">Light</div>
                    <div className="text-sm text-gray-500">
                      Clean and bright
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, theme: "dark" }))
                    }
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                      settings.theme === "dark"
                        ? "border-yellow-600 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Moon className="h-6 w-6 mb-2 text-gray-600" />
                    <div className="font-medium text-gray-900">Dark</div>
                    <div className="text-sm text-gray-500">
                      Easy on the eyes
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Compact View</div>
                  <div className="text-sm text-gray-500">
                    Show more content in less space
                  </div>
                </div>
                <button
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      compactView: !prev.compactView,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 ${
                    settings.compactView ? "bg-yellow-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.compactView ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            {/* Data Statistics */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                  <p className="text-sm text-gray-600">Users</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{groups.length}</p>
                  <p className="text-sm text-gray-600">Groups</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{expenses.length}</p>
                  <p className="text-sm text-gray-600">Expenses</p>
                </div>
              </div>
            </div>

            {/* Data Management Actions */}
            <div className="space-y-4">
              {/* Export Data */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Export Data</h3>
                    <p className="text-sm text-gray-500">Download a backup of all your data</p>
                  </div>
                </div>
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Export
                </button>
              </div>

              {/* Import Data */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Import Data</h3>
                    <p className="text-sm text-gray-500">Restore data from a backup file</p>
                  </div>
                </div>
                <label className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset to Demo Data */}
              <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Reset to Demo Data</h3>
                    <p className="text-sm text-gray-500">Load sample data for testing</p>
                  </div>
                </div>
                <button
                  onClick={handleResetToDemo}
                  disabled={isResetting}
                  className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                >
                  {isResetting ? 'Resetting...' : 'Reset'}
                </button>
              </div>

              {/* Clear All Data */}
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Clear All Data</h3>
                    <p className="text-sm text-gray-500">Permanently delete all your data</p>
                  </div>
                </div>
                <button
                  onClick={handleClearAllData}
                  disabled={isClearing}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isClearing ? 'Clearing...' : 'Clear All'}
                </button>
              </div>
            </div>

            {/* App Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">App Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">App Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Storage</span>
                  <span className="font-medium">Local Browser Storage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Customize your Momo Splitwise experience
          </p>
        </div>

        {activeTab !== "data" && (
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-600 to-yellow-700 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Settings Sidebar */}
          <div className="lg:col-span-1 border-r border-gray-200">
            <nav className="p-6 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-linear-to-r from-yellow-600 to-yellow-700 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-50 hover:text-yellow-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="p-8">{renderSettingsContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;