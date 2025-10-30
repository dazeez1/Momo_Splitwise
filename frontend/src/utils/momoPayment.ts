/**
 * Utility functions for Mobile Money payments
 */

interface MomoProvider {
  name: string;
  code: string;
  format: (number: string, amount: number) => string;
}

const MOMO_PROVIDERS: { [key: string]: MomoProvider } = {
  MTN: {
    name: "MTN Mobile Money",
    code: "*182*",
    format: (number: string, amount: number) => {
      // Remove + and format: *182*1*1*phone*amount#
      const cleanNumber = number.replace(/\+/g, "");
      return `*182*1*1*${cleanNumber}*${amount}#`;
    },
  },
  Airtel: {
    name: "Airtel Money",
    code: "*185*",
    format: (number: string, amount: number) => {
      // Remove + and format: *185*1*phone*amount#
      const cleanNumber = number.replace(/\+/g, "");
      return `*185*1*${cleanNumber}*${amount}#`;
    },
  },
  SPENN: {
    name: "SPENN",
    code: "*555*",
    format: (number: string, amount: number) => {
      // SPENN typically uses *555*1*phone*amount#
      const cleanNumber = number.replace(/\+/g, "");
      return `*555*1*${cleanNumber}*${amount}#`;
    },
  },
  Bank: {
    name: "Bank Transfer",
    code: "",
    format: (number: string, amount: number) => {
      // Bank transfers don't use USSD codes
      return `Transfer ${amount} to account: ${number}`;
    },
  },
  Other: {
    name: "Other",
    code: "",
    format: (number: string, amount: number) => {
      return `${number} - Amount: ${amount}`;
    },
  },
};

/**
 * Generate USSD code for mobile money payment
 */
export const generatePaymentCode = (
  provider: string,
  number: string,
  amount: number
): string => {
  const providerConfig = MOMO_PROVIDERS[provider] || MOMO_PROVIDERS.Other;
  return providerConfig.format(number, amount);
};

/**
 * Get provider info
 */
export const getProviderInfo = (provider: string): MomoProvider => {
  return MOMO_PROVIDERS[provider] || MOMO_PROVIDERS.Other;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

/**
 * Create a phone call URL
 */
export const createPhoneCallUrl = (code: string): string => {
  // Remove # and * from the beginning for tel: URL
  const cleaned = code.replace(/^[*#]+/, "");
  return `tel:${cleaned}`;
};
