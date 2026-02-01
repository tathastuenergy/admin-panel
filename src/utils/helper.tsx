export const generateEstimateNumber = (lastEstimate: any) => {
  if (!lastEstimate) return "TE2526001";

  const prefix = "TE2526";
  const lastNumber = parseInt(lastEstimate.replace(prefix, ""), 10);
  const nextNumber = lastNumber + 1;

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const generateInvoiceNumber = (lastInvoice: string | null) => {
  const prefix = "INV-";

  console.log('lastInvoice', lastInvoice)
  if (!lastInvoice) {
    return `${prefix}001`;
  }

  const lastNumber = parseInt(lastInvoice.replace(prefix, ""), 10);
  const nextNumber = lastNumber + 1;

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const numberToWords = (num: number): string => {
  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
  ];

  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];

  if (num < 20) return ones[num];
  if (num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "");
  }
  if (num < 1000) {
    return ones[Math.floor(num / 100)] + " hundred" + (num % 100 !== 0 ? " " + numberToWords(num % 100) : "");
  }
  if (num < 1000000) {
    return numberToWords(Math.floor(num / 1000)) + " thousand" + (num % 1000 !== 0 ? " " + numberToWords(num % 1000) : "");
  }

  return "number too large";
}

