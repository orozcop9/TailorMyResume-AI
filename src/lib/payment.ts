
export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(" ");
  } else {
    return value;
  }
};

export const formatExpiryDate = (value: string): string => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  if (v.length >= 2) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
  }
  return v;
};

export const validateCardNumber = (cardNumber: string): boolean => {
  const number = cardNumber.replace(/\s+/g, "");
  return /^[0-9]{16}$/.test(number);
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate)) {
    return false;
  }

  const [month, year] = expiryDate.split("/");
  const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const today = new Date();
  return expiry > today;
};

export const validateCVV = (cvv: string): boolean => {
  return /^[0-9]{3,4}$/.test(cvv);
};
