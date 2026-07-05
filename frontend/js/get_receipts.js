import { BASE_URL } from "./config.js";

console.log("get");

export async function loadReceipts() {
  try {
    const response = await fetch(`${BASE_URL}/receipts`);
    if (!response.ok) throw new Error("Failed to fetch receipts");
    const receipts = await response.json();
    console.log(receipts);
    return receipts;
  } catch (error) {
    console.error(error);
    return []; // always return array so charts don't crash on undefined
  }
}
