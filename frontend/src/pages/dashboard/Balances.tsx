import React, { useState, useEffect } from "react";
import { Scale, ArrowRight, User, Users, Send, Loader2 } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { formatCurrency } from "../../utils/calculations";
import type { Debt } from "../../types";

const Balances: React.FC = () => {
  const { user } = useAuth();
  const { groups, users, simplifyDebts, simplifyDebtsFromAPI } = useApp();
  const { showToast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userGroups = groups.filter((group) =>
    group.members.includes(user?.id || "")
  );

  // Calculate debts for selected group or all groups
  useEffect(() => {
    const calculateDebts = async () => {
      setIsLoading(true);
      try {
        if (selectedGroup === "all") {
          // For "all", use client-side calculation for efficiency
          const allDebts = userGroups.flatMap((group) =>
            simplifyDebts(group.id).map((debt: Debt) => ({
              ...debt,
              groupId: group.id,
              groupName: group.name,
            }))
          );
          setDebts(allDebts);
        } else {
          // For specific group, try API first
          try {
            const apiDebts = await simplifyDebtsFromAPI(selectedGroup);
            const mappedDebts = apiDebts.map((debt: Debt) => ({
              ...debt,
              groupId: selectedGroup,
              groupName: userGroups.find((g) => g.id === selectedGroup)?.name,
            }));
            setDebts(mappedDebts);
          } catch (error) {
            // Fallback to client-side
            const clientDebts = simplifyDebts(selectedGroup).map(
              (debt: Debt) => ({
                ...debt,
                groupId: selectedGroup,
                groupName: userGroups.find((g) => g.id === selectedGroup)?.name,
              })
            );
            setDebts(clientDebts);
          }
        }
      } catch (error) {
        console.error("Error calculating debts:", error);
        showToast(
          "Error loading balances. Using offline calculation.",
          "warning"
        );
        // Final fallback
        if (selectedGroup === "all") {
          const fallbackDebts = userGroups.flatMap((group) =>
            simplifyDebts(group.id).map((debt: Debt) => ({
              ...debt,
              groupId: group.id,
              groupName: group.name,
            }))
          );
          setDebts(fallbackDebts);
        } else {
          const fallbackDebts = simplifyDebts(selectedGroup).map(
            (debt: Debt) => ({
              ...debt,
              groupId: selectedGroup,
              groupName: userGroups.find((g) => g.id === selectedGroup)?.name,
            })
          );
          setDebts(fallbackDebts);
        }
      } finally {
        setIsLoading(false);
      }
    };

    calculateDebts();
  }, [
    selectedGroup,
    userGroups,
    simplifyDebts,
    simplifyDebtsFromAPI,
    showToast,
  ]);

  // Filter debts that involve the current user
  const userDebts = debts.filter(
    (debt: Debt) => debt.from === user?.id || debt.to === user?.id // Added type annotation
  );

  // People you owe
  const youOwe = userDebts.filter((debt: Debt) => debt.from === user?.id); // Added type annotation

  // People who owe you
  const oweYou = userDebts.filter((debt: Debt) => debt.to === user?.id); // Added type annotation

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Unknown User";
  };

  const handleSettleUp = (debt: Debt & { groupName?: string }) => {
    const creditorName = getUserName(debt.to);
    showToast(
      `Initiating payment of ${formatCurrency(
        debt.amount,
        debt.currency
      )} to ${creditorName} for ${debt.groupName || "group expenses"}`,
      "info"
    );
    // In a real app, this would open a payment modal or redirect to payments page
  };

  const handleRequestPayment = (debt: Debt & { groupName?: string }) => {
    const debtorName = getUserName(debt.from);
    showToast(
      `Requesting payment of ${formatCurrency(
        debt.amount,
        debt.currency
      )} from ${debtorName} for ${debt.groupName || "group expenses"}`,
      "info"
    );
    // In a real app, this would open a payment request modal
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-luxury font-bold text-gray-900">
            Balances
          </h1>
          <p className="text-gray-600 mt-2">
            Track who owes whom and simplify group debts
          </p>
        </div>
      </div>

      {/* Group Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <Scale className="h-6 w-6 text-yellow-600" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Simplify Debts
            </h3>
            <p className="text-gray-600 text-sm">
              Minimize the number of transactions needed to settle all debts
            </p>
          </div>
          {isLoading && (
            <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Group
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            disabled={isLoading}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">All Groups</option>
            {userGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* You Owe Section */}
      {youOwe.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-red-600 flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              You Owe
              <span className="ml-2 text-sm font-normal text-gray-500">
                (
                {formatCurrency(
                  youOwe.reduce(
                    (sum: number, debt: Debt) => sum + debt.amount,
                    0
                  ), // Added type annotations
                  "RWF"
                )}
                )
              </span>
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {youOwe.map(
              (
                debt: Debt,
                index: number // Added type annotations
              ) => (
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
                        {getUserName(debt.to)}
                      </p>
                      <p className="text-sm text-gray-500">{debt.groupName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(debt.amount, debt.currency)}
                      </p>
                      <p className="text-sm text-gray-500">Total owed</p>
                    </div>
                    <button
                      onClick={() => handleSettleUp(debt)}
                      className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-yellow-600 to-yellow-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      <Send className="h-4 w-4" />
                      <span>Pay</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Owe You Section */}
      {oweYou.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-green-600 flex items-center">
              <ArrowRight className="h-5 w-5 mr-2 transform rotate-180" />
              Owe You
              <span className="ml-2 text-sm font-normal text-gray-500">
                (
                {formatCurrency(
                  oweYou.reduce(
                    (sum: number, debt: Debt) => sum + debt.amount,
                    0
                  ), // Added type annotations
                  "RWF"
                )}
                )
              </span>
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {oweYou.map(
              (
                debt: Debt,
                index: number // Added type annotations
              ) => (
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
                        {getUserName(debt.from)}
                      </p>
                      <p className="text-sm text-gray-500">{debt.groupName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(debt.amount, debt.currency)}
                      </p>
                      <p className="text-sm text-gray-500">Total to receive</p>
                    </div>
                    <button
                      onClick={() => handleRequestPayment(debt)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      <Send className="h-4 w-4" />
                      <span>Request</span>
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* No Debts State */}
      {youOwe.length === 0 && oweYou.length === 0 && (
        <div className="text-center py-12">
          <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All settled up!
          </h3>
          <p className="text-gray-500">
            You don't owe anyone and no one owes you.
          </p>
        </div>
      )}

      {/* Simplified Transactions */}
      {debts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Simplified Transactions
            </h3>
            <span className="text-sm text-gray-500">
              {debts.length} transactions needed
            </span>
          </div>
          <div className="space-y-3">
            {debts.map((debt: Debt, index: number) => {
              // Added type annotations
              const isUserInvolved =
                debt.from === user?.id || debt.to === user?.id;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    isUserInvolved
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        debt.from === user?.id
                          ? "bg-red-100 text-red-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      <User className="h-4 w-4" />
                    </div>
                    <span
                      className={`font-medium ${
                        debt.from === user?.id
                          ? "text-red-700"
                          : "text-gray-900"
                      }`}
                    >
                      {getUserName(debt.from)}
                      {debt.from === user?.id && " (You)"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-semibold">
                      {formatCurrency(debt.amount, debt.currency)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`font-medium ${
                        debt.to === user?.id
                          ? "text-green-700"
                          : "text-gray-900"
                      }`}
                    >
                      {getUserName(debt.to)}
                      {debt.to === user?.id && " (You)"}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        debt.to === user?.id
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      <User className="h-4 w-4" />
                    </div>
                  </div>

                  {debt.groupName && debt.groupName !== "all" && (
                    <div className="ml-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {debt.groupName}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Balances;
