import axios from "axios";

export async function handler(event) {
  const parts = event.path.split("/");
  const code = parts[parts.length - 1];
  if (!code || code === "barcode") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing barcode" }),
    };
  }

  const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;
  console.log(`\u{1F4E3} Fetching: ${apiUrl}`);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
        Accept: "application/json",
      },
    });

    if (response.data.status === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify(response.data.product),
      };
    }

    console.error(`Product not found: ${code}`);
    return { statusCode: 404, body: JSON.stringify({ error: "Product not found" }) };
  } catch (error) {
    console.error("API Request Failed:", error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: "Failed to fetch data" }),
    };
  }
}
