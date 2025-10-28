import React, { useState, useRef } from "react";
import { User, Mail, Phone, Camera, Save, X, Wallet } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useApp } from "../../contexts/AppContext";

const Profile: React.FC = () => {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const { showToast } = useToast();
  const { groups, expenses, payments } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate actual statistics
  const userGroups = groups.filter((group) =>
    group.members.includes(user?.id || "")
  );
  const userExpenses = expenses.filter(
    (expense) =>
      expense.splits.some((split) => split.userId === user?.id) ||
      expense.paidBy === user?.id
  );
  const userPayments = payments.filter(
    (payment) =>
      payment.fromUserId === user?.id || payment.toUserId === user?.id
  );
  const totalDebts = userExpenses.reduce((sum, expense) => {
    const userSplit = expense.splits.find((split) => split.userId === user?.id);
    return sum + (userSplit?.amount || 0);
  }, 0);
  const totalSpent = userExpenses.reduce((sum, expense) => {
    if (expense.paidBy === user?.id) {
      return sum + expense.amount;
    }
    return sum;
  }, 0);
  const settledPayments = userPayments.filter(
    (p) => p.status === "completed"
  ).length;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    mobileMoneyNumber: user?.mobileMoneyNumber || "",
    mobileMoneyProvider: user?.mobileMoneyProvider || "",
  });
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || ""
  );
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast("Please select an image file", "error");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size must be less than 5MB", "error");
        return;
      }

      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPreviewImage(base64);
        setProfilePicture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage("");
    setProfilePicture("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Only send fields that have changed
      const updateData: any = {};

      // Check if profile picture changed
      if (profilePicture !== (user?.profilePicture || "")) {
        updateData.profilePicture = profilePicture;
      }

      // Check if name changed
      if (formData.name !== (user?.name || "")) {
        updateData.name = formData.name;
      }

      // Check if phone number changed
      if (formData.phoneNumber !== (user?.phoneNumber || "")) {
        updateData.phoneNumber = formData.phoneNumber;
      }

      // Check if mobile money number changed
      if (formData.mobileMoneyNumber !== (user?.mobileMoneyNumber || "")) {
        updateData.mobileMoneyNumber = formData.mobileMoneyNumber;
      }

      // Check if mobile money provider changed
      if (formData.mobileMoneyProvider !== (user?.mobileMoneyProvider || "")) {
        updateData.mobileMoneyProvider = formData.mobileMoneyProvider;
      }

      // Only call API if there are changes
      if (Object.keys(updateData).length > 0) {
        await updateAuthProfile(updateData);
      }

      showToast("Profile updated successfully", "success");
      setIsEditing(false);
      setPreviewImage("");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showToast(error?.message || "Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      mobileMoneyNumber: user?.mobileMoneyNumber || "",
      mobileMoneyProvider: user?.mobileMoneyProvider || "",
    });
    setProfilePicture(user?.profilePicture || "");
    setPreviewImage("");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">
            Profile
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information and account settings
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-700 to-yellow-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <User className="h-5 w-5" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-700 to-yellow-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="relative">
              {profilePicture || previewImage ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-100">
                  <img
                    src={previewImage || profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-linear-to-r from-yellow-700 to-yellow-600 rounded-full flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
              {isEditing && (
                <div className="absolute -bottom-2 right-2 flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 bg-yellow-600 hover:bg-yellow-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
                    title="Change photo"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                  {(profilePicture || previewImage) && (
                    <button
                      onClick={handleRemoveImage}
                      className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
                      title="Remove photo"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                {user?.name}
              </h2>
              <p className="text-gray-500 mt-1">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{user?.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{user?.phoneNumber}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Money Number
                  <span className="text-xs text-gray-500 ml-1">
                    (for payments)
                  </span>
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <select
                      value={formData.mobileMoneyProvider}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mobileMoneyProvider: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select provider</option>
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Airtel">Airtel Money</option>
                      <option value="SPENN">SPENN</option>
                      <option value="Bank">Bank Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="e.g., 0781234567"
                      value={formData.mobileMoneyNumber}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mobileMoneyNumber: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Wallet className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      {user?.mobileMoneyNumber ? (
                        <div>
                          <span className="text-gray-900 font-medium">
                            {user.mobileMoneyNumber}
                          </span>
                          {user.mobileMoneyProvider && (
                            <span className="text-sm text-gray-500 ml-2">
                              ({user.mobileMoneyProvider})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Statistics */}
            {!isEditing && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-2xl font-bold text-yellow-700">
                      {userGroups.length}
                    </div>
                    <div className="text-sm text-gray-600">Groups</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-2xl font-bold text-yellow-700">
                      {userExpenses.length}
                    </div>
                    <div className="text-sm text-gray-600">Expenses</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-2xl font-bold text-yellow-700">
                      {userPayments.length}
                    </div>
                    <div className="text-sm text-gray-600">Transactions</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-2xl font-bold text-green-600">
                      {settledPayments}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
