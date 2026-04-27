import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/barcode/:code", async (req, res) => {
  const barcode = req.params.code;

  if (!/^\d{6,14}$/.test(barcode)) {
    return res.status(400).json({ error: "Invalid barcode format" });
  }

  const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

  console.log(`📡 Incoming request: ${req.method} ${req.url}`);
  console.log(`🔍 Fetching data from: ${apiUrl}`);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
        Accept: "application/json",
      },
    });

    console.log("✅ API Response:", response.data);

    if (response.data.status === 1) {
      res.json(response.data.product);
    } else {
      console.error(`❌ Product not found: ${barcode}`);
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error(
      "❌ API Request Failed:",
      error.response?.data || error.message
    );
    res
      .status(error.response?.status || 500)
      .json({ error: "Failed to fetch data" });
  }
});

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`🚀 Proxy running on http://localhost:${PORT}`)
);
