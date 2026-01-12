export const RAZORPAY_CONFIG = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  currency: "INR",
  name: "Carat Craft Boutique",
  description: "Premium jewellery Store",
  image: "/logo.png", // Add your logo path here
  prefill: {
    name: "",
    email: "",
    contact: "",
  },
  theme: {
    color: "#0F172A", // You can customize this
  },
}; 