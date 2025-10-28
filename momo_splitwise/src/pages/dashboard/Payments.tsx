import React, { useState, useEffect } from "react";
import {
  Send,
  Download,
  Phone,
  Wallet,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  User,
  Plus,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency } from "../../utils/calculations";
import SendPaymentModal from "../../components/payments/SendPaymentModal";
import RequestPaymentModal from "../../components/payments/RequestPaymentModal";
import type { Balance } from "../../types";

interface PaymentRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  description: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  createdAt: string;
  completedAt?: string;
  groupId: string;
}

const Payments: React.FC = () => {
  const { user } = useAuth();
  const { groups, users, calculateBalances, simplifyDebts } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "send" | "history">(
    "overview"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const userGroups = groups.filter((group) =>
    group.members.includes(user?.id || "")
  );

  // Calculate balances for the selected group
  const balances =
    selectedGroup === "all"
      ? userGroups.flatMap((group) => calculateBalances(group.id))
      : calculateBalances(selectedGroup);

  // Filter balances to show only what the current user owes or is owed
  const userBalances = balances.filter(
    (balance) => balance.userId === user?.id && Math.abs(balance.balance) > 0.01
  );

  // People who owe the current user
  const peopleOweYou = balances
    .filter((balance) => balance.balance < -0.01 && balance.userId !== user?.id)
    .map((balance) => {
      const debtor = users.find((u) => u.id === balance.userId);
      const group = groups.find((g) => g.id === balance.groupId);
      return {
        user: debtor,
        amount: Math.abs(balance.balance),
        currency: balance.currency,
        group: group?.name,
        groupId: balance.groupId,
      };
    });

  // People the current user owes
  const youOwePeople = balances
    .filter((balance) => balance.balance > 0.01 && balance.userId !== user?.id)
    .map((balance) => {
      const creditor = users.find((u) => u.id === balance.userId);
      const group = groups.find((g) => g.id === balance.groupId);
      return {
        user: creditor,
        amount: balance.balance,
        currency: balance.currency,
        group: group?.name,
        groupId: balance.groupId,
      };
    });

  // Mock payment requests (in a real app, this would come from an API)
  useEffect(() => {
    const mockRequests: PaymentRequest[] = [
      {
        id: "1",
        fromUserId: "user2",
        toUserId: user?.id || "",
        amount: 25000,
        currency: "RWF",
        description: "Dinner at restaurant",
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        groupId: "group1",
      },
      {
        id: "2",
        fromUserId: user?.id || "",
        toUserId: "user3",
        amount: 15000,
        currency: "RWF",
        description: "Uber rides",
        status: "completed",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(
          Date.now() - 4 * 24 * 60 * 60 * 1000
        ).toISOString(),
        groupId: "group2",
      },
      {
        id: "3",
        fromUserId: "user4",
        toUserId: user?.id || "",
        amount: 30000,
        currency: "RWF",
        description: "Monthly rent share",
        status: "failed",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        groupId: "group1",
      },
    ];
    setPaymentRequests(mockRequests);
  }, [user]);

  const handleSendPayment = (
    toUserId: string,
    amount: number,
    description: string,
    groupId?: string
  ) => {
    // In a real app, this would integrate with mobile money API
    const newPayment: PaymentRequest = {
      id: Date.now().toString(),
      fromUserId: user?.id || "",
      toUserId,
      amount,
      currency: "RWF",
      description,
      status: "completed",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      groupId: groupId || "direct",
    };

    setPaymentRequests((prev) => [newPayment, ...prev]);
    alert(`Payment of ${formatCurrency(amount, "RWF")} sent successfully!`);
  };

  const handleRequestPayment = (
    fromUserId: string,
    amount: number,
    description: string,
    groupId?: string
  ) => {
    const newRequest: PaymentRequest = {
      id: Date.now().toString(),
      fromUserId,
      toUserId: user?.id || "",
      amount,
      currency: "RWF",
      description,
      status: "pending",
      createdAt: new Date().toISOString(),
      groupId: groupId || "direct",
    };

    setPaymentRequests((prev) => [newRequest, ...prev]);
    alert("Payment request sent! The recipient will be notified.");
  };

  const handleCancelRequest = (paymentId: string) => {
    setPaymentRequests((prev) =>
      prev.map((request) =>
        request.id === paymentId
          ? { ...request, status: "cancelled" as const }
          : request
      )
    );
  };

  const getStatusIcon = (status: PaymentRequest["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: PaymentRequest["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "failed":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const filteredPaymentRequests = paymentRequests.filter(
    (request) =>
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users
        .find(
          (u) =>
            u.id ===
            (request.fromUserId === user?.id
              ? request.toUserId
              : request.fromUserId)
        )
        ?.name.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Date", "Type", "User", "Amount", "Description", "Status"];
    const csvData = filteredPaymentRequests.map((request) => {
      const isOutgoing = request.fromUserId === user?.id;
      const otherUser = users.find(
        (u) => u.id === (isOutgoing ? request.toUserId : request.fromUserId)
      );

      return [
        new Date(request.createdAt).toLocaleDateString(),
        isOutgoing ? "Sent" : "Received",
        otherUser?.name || "Unknown",
        formatCurrency(request.amount, request.currency),
        request.description,
        request.status,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `momo-payments-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">
            Payments
          </h1>
          <p className="text-gray-600 mt-2">
            Send and receive payments with mobile money integration
          </p>
        </div>

        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <Download className="h-5 w-5" />
            <span>Request</span>
          </button>
          <button
            onClick={() => setIsSendModalOpen(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-yellow-600 to-yellow-700 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Send className="h-5 w-5" />
            <span>Send Payment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                id: "overview",
                name: "Overview",
                count: youOwePeople.length + peopleOweYou.length,
              },
              { id: "send", name: "Send & Request" },
              {
                id: "history",
                name: "History",
                count: filteredPaymentRequests.length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-yellow-600 text-yellow-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 py-0.5 px-2 text-xs rounded-full ${
                      activeTab === tab.id
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-linear-to-br from-red-500 to-red-600 text-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">You Owe</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(
                          youOwePeople.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          ),
                          "RWF"
                        )}
                      </p>
                      <p className="text-red-200 text-sm mt-1">
                        {youOwePeople.length} people
                      </p>
                    </div>
                    <Download className="h-8 w-8 text-red-200" />
                  </div>
                </div>

                <div className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">You Are Owed</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(
                          peopleOweYou.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          ),
                          "RWF"
                        )}
                      </p>
                      <p className="text-green-200 text-sm mt-1">
                        {peopleOweYou.length} people
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Net Balance</p>
                      <p
                        className={`text-2xl font-bold mt-1 ${
                          youOwePeople.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          ) -
                            peopleOweYou.reduce(
                              (sum, item) => sum + item.amount,
                              0
                            ) >
                          0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatCurrency(
                          youOwePeople.reduce(
                            (sum, item) => sum + item.amount,
                            0
                          ) -
                            peopleOweYou.reduce(
                              (sum, item) => sum + item.amount,
                              0
                            ),
                          "RWF"
                        )}
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* You Owe Section */}
              {youOwePeople.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      You Owe
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {youOwePeople.map((item, index) => (
                      <div
                        key={index}
                        className="p-6 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full">
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.user?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.group}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(item.amount, item.currency)}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => {
                                setIsSendModalOpen(true);
                                // In a real app, pre-fill the send modal with this data
                              }}
                              className="px-4 py-2 bg-linear-to-r from-yellow-600 to-yellow-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                            >
                              Pay Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* You Are Owed Section */}
              {peopleOweYou.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      You Are Owed
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {peopleOweYou.map((item, index) => (
                      <div
                        key={index}
                        className="p-6 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full">
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.user?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.group}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(item.amount, item.currency)}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => {
                                setIsRequestModalOpen(true);
                                // In a real app, pre-fill the request modal with this data
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
                            >
                              Request
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {youOwePeople.length === 0 && peopleOweYou.length === 0 && (
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All settled up!
                  </h3>
                  <p className="text-gray-500">
                    You don't owe anyone and no one owes you.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Send & Request Tab */}
          {activeTab === "send" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Send Payment Card */}
              <div className="bg-linear-to-br from-yellow-600 to-yellow-700 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Send Payment</h3>
                  <Send className="h-6 w-6" />
                </div>
                <p className="text-yellow-100 mb-6">
                  Send money directly to friends via mobile money
                </p>

                <div className="space-y-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Quick Send</h4>
                    <p className="text-yellow-100 text-sm mb-4">
                      Send to someone you owe money
                    </p>
                    {youOwePeople.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <span>{item.user?.name}</span>
                        <button
                          onClick={() => {
                            setIsSendModalOpen(true);
                          }}
                          className="bg-white text-yellow-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                          Pay {formatCurrency(item.amount, "RWF")}
                        </button>
                      </div>
                    ))}
                    {youOwePeople.length === 0 && (
                      <p className="text-yellow-200 text-sm">
                        No pending payments to send
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setIsSendModalOpen(true)}
                    className="w-full bg-white text-yellow-700 py-3 px-4 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    Send New Payment
                  </button>
                </div>
              </div>

              {/* Request Payment Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Request Payment
                  </h3>
                  <Download className="h-6 w-6 text-gray-600" />
                </div>
                <p className="text-gray-600 mb-6">
                  Send a payment request to someone who owes you
                </p>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Quick Request
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      Request from someone who owes you
                    </p>
                    {peopleOweYou.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-gray-900">{item.user?.name}</span>
                        <button
                          onClick={() => {
                            setIsRequestModalOpen(true);
                          }}
                          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-yellow-700 transition-colors"
                        >
                          Request {formatCurrency(item.amount, "RWF")}
                        </button>
                      </div>
                    ))}
                    {peopleOweYou.length === 0 && (
                      <p className="text-gray-500 text-sm">
                        No pending payment requests
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    New Payment Request
                  </button>
                </div>
              </div>

              {/* Mobile Money Providers */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Supported Mobile Money Providers
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      name: "MTN Mobile Money",
                      color: "bg-yellow-500",
                      code: "*182#",
                    },
                    {
                      name: "Airtel Money",
                      color: "bg-red-500",
                      code: "*182#",
                    },
                    { name: "SPENN", color: "bg-blue-500", code: "*555#" },
                    {
                      name: "Bank Transfer",
                      color: "bg-green-500",
                      code: "N/A",
                    },
                  ].map((provider, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg text-center"
                    >
                      <div
                        className={`w-12 h-12 ${provider.color} rounded-full flex items-center justify-center mb-3`}
                      >
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <span className="font-medium text-gray-900 mb-1">
                        {provider.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {provider.code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export CSV</span>
                  </button>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
                {filteredPaymentRequests.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredPaymentRequests.map((request) => {
                      const isOutgoing = request.fromUserId === user?.id;
                      const otherUser = users.find(
                        (u) =>
                          u.id ===
                          (isOutgoing ? request.toUserId : request.fromUserId)
                      );
                      const group = groups.find(
                        (g) => g.id === request.groupId
                      );

                      return (
                        <div key={request.id} className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {getStatusIcon(request.status)}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {isOutgoing ? "Sent to" : "Received from"}{" "}
                                  {otherUser?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {request.description}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <p className="text-xs text-gray-400">
                                    {new Date(
                                      request.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                  {group && group.id !== "direct" && (
                                    <span className="text-xs text-gray-400">
                                      • {group.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${
                                  isOutgoing ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {isOutgoing ? "-" : "+"}
                                {formatCurrency(
                                  request.amount,
                                  request.currency
                                )}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                    request.status
                                  )}`}
                                >
                                  {request.status}
                                </span>
                                {request.status === "pending" && isOutgoing && (
                                  <button
                                    onClick={() =>
                                      handleCancelRequest(request.id)
                                    }
                                    className="text-xs text-red-600 hover:text-red-700"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No payment history
                    </h3>
                    <p className="text-gray-500">
                      Your payment transactions will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Payment Modal */}
      <SendPaymentModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSendPayment={handleSendPayment}
        users={users.filter((u) => u.id !== user?.id)}
        youOwePeople={youOwePeople}
      />

      {/* Request Payment Modal */}
      <RequestPaymentModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onRequestPayment={handleRequestPayment}
        users={users.filter((u) => u.id !== user?.id)}
        peopleOweYou={peopleOweYou}
      />
    </div>
  );
};

export default Payments;