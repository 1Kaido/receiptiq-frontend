import {BASE_URL} from "./config.js"


export async function send_img(url, post, selectedImage) {
  
  const formData = new FormData();
  formData.append("image", selectedImage);
  
  try {
    
    const response = await fetch(`${url}${post}`, {
      method: "POST",
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log("✅ Success:", data);
    
    return data;
    
  } catch (error) {
    
    console.error("❌ Error:", error);
    
    throw error;
    
  }
  
}


export async function loadReceipts() {
  
    try {
         let p = "/receipts"
        const response = await fetch(`${BASE_URL}${p}`);

        if (!response.ok) {
            throw new Error("Failed to fetch receipts");
        }

        const receipts = await response.json();

        console.log(receipts);

        // Display them
        receipts.forEach(receipt => {
            console.log(
                receipt.supplier,
                receipt.amount,
                receipt.date,
                receipt.category
            );
        });

    } catch (error) {
        console.error(error);
    }
}

export async function convertToINR(amount, fromCurrency) {
    if (fromCurrency === "INR") return amount;
    
    const response = await fetch(
        `https://api.frankfurter.dev/v1/latest?base=${fromCurrency}&symbols=INR`
    );
    
    const data = await response.json();
    
    return +(amount * data.rates.INR).toFixed(2);
}

