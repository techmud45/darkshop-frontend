export const formatBtcAmount = (sats) => {
  return (sats / 100000000).toFixed(8);
};

export const generateBitcoinURI = (address, amount) => {
  return `bitcoin:${address}?amount=${amount}`;
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};
