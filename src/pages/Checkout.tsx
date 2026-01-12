import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  Typography,
  TextField,
  Radio,
  CircularProgress,
  Stack,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as ShippingIcon,
  CreditCard as CreditCardIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

import { styled } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import LogoTitle from "../assets/logo_black.png";
import { useCart } from "../providers/CartContext";
import { toast } from "sonner";

// Styled Components - Minimalist Design
const SectionWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(3),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "1.5px",
  textTransform: "uppercase",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
}));

const StepIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active",
})<{ active: boolean }>(({ theme, active }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: active ? "#4A3B2A" : "transparent",
  border: `1.5px solid ${
    active ? "#4A3B2A" : alpha(theme.palette.divider, 0.3)
  }`,
  color: active ? "#fff" : theme.palette.text.disabled,
  fontSize: 13,
  fontWeight: 600,
  transition: "all 0.3s ease",
  [theme.breakpoints.down("sm")]: {
    width: 28,
    height: 28,
    fontSize: 12,
  },
}));

const AddressCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected: boolean }>(({ theme, selected }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 8,
  border: `1.5px solid ${
    selected ? "#4A3B2A" : alpha(theme.palette.divider, 0.15)
  }`,
  background: selected ? alpha("#4A3B2A", 0.02) : "transparent",
  cursor: "pointer",
  transition: "all 0.2s ease",
  "&:hover": {
    borderColor: "#4A3B2A",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const PaymentOption = styled(Box, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected: boolean }>(({ theme, selected }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  border: `1.5px solid ${
    selected ? "#4A3B2A" : alpha(theme.palette.divider, 0.15)
  }`,
  background: selected ? alpha("#4A3B2A", 0.02) : "transparent",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  "&:hover": {
    borderColor: "#4A3B2A",
  },
}));

const MinimalTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 6,
    backgroundColor: alpha(theme.palette.common.black, 0.02),
    "& fieldset": {
      borderColor: alpha(theme.palette.divider, 0.12),
    },
    "&:hover fieldset": {
      borderColor: alpha("#4A3B2A", 0.4),
    },
    "&.Mui-focused fieldset": {
      borderColor: "#4A3B2A",
      borderWidth: 1.5,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#4A3B2A",
  },
}));

type ShippingAddress = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
};

const Checkout = () => {
  const navigate = useNavigate();

  // Use CartContext
  const { items: cartItems, totalPrice: cartTotal, clearCart } = useCart();

  // State
  const [activeStep, setActiveStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "IN",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Steps
  const steps = ["Shipping", "Payment", "Confirmation"];

  useEffect(() => {
    const ensureProfileExists = async (userId: string, userEmail: string) => {
      try {
        // Check if profile exists by ID or email
        const { data: existingProfile, error: checkError } = await supabase
          .from("profiles")
          .select("id, email")
          .or(`id.eq.${userId},email.eq.${userEmail}`)
          .maybeSingle();

        if (checkError) {
          console.error("Error checking profile:", checkError);
        }

        // If profile doesn't exist, create it
        if (!existingProfile) {
          console.log("Profile not found, creating one...");

          // Try to insert profile
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([
              {
                id: userId,
                email: userEmail,
                full_name: userEmail.split("@")[0] || "User",
                shipping_addresses: [],
              },
            ])
            .select()
            .single();

          if (createError) {
            // Check if it's a duplicate key error (23505)
            if (createError.code === "23505") {
              console.log("Profile already exists (duplicate), continuing...");
            } else {
              console.error("Error creating profile:", createError);
              toast.error(
                "Failed to initialize user profile. Please refresh the page."
              );
            }
          } else {
            console.log("Profile created successfully:", newProfile);
          }

          // Also ensure user_roles entry exists
          const { data: existingRole } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("user_id", userId)
            .maybeSingle();

          if (!existingRole) {
            // Try to create user_roles entry
            const { error: roleCreateError } = await supabase
              .from("user_roles")
              .insert([{ id: userId, role: "user" }]);

            if (roleCreateError && roleCreateError.code !== "23505") {
              console.error("Error creating user role:", roleCreateError);
            }
          }
        } else if (
          existingProfile.id !== userId &&
          existingProfile.email === userEmail
        ) {
          console.warn(
            "Profile exists with different user_id, this may cause issues"
          );
        }
      } catch (error) {
        console.error("Error in ensureProfileExists:", error);
      }
    };

    const fetchAddresses = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("shipping_addresses")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching addresses:", error);
        return;
      }

      if (data?.shipping_addresses && Array.isArray(data.shipping_addresses)) {
        setSavedAddresses(data.shipping_addresses);
      }
    };

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await ensureProfileExists(user.id, user.email || "");
        await fetchAddresses(user.id);
      }
    })();
  }, []);

  // Calculations
  const calculateSubtotal = () => cartTotal || 0;
  const calculateTax = () => calculateSubtotal() * 0.18; // 18% GST
  const calculateShipping = () => (calculateSubtotal() > 4999 ? 0 : 99);
  const calculateTotal = () =>
    calculateSubtotal() + calculateTax() + calculateShipping();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById("razorpay-sdk")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // In your Checkout component, update the payment handling:

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("User not authenticated");
      }

      // Generate a proper UUID for database
      const orderUuid = uuidv4();
      // Generate order number
      const orderNumber = `ORD${Date.now().toString().slice(-8)}`;

      // Create order in Razorpay
      const response = await axios.post(
        "https://jeokcwaellvizdaoywze.supabase.co/functions/v1/create-order",
        {
          amount: Math.round(calculateTotal() * 100), // Amount in paise
          currency: "INR",
          receipt: orderNumber,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        const razorpayOrderId = data.id; // This is the Razorpay order ID (string)

        // Save order to database BEFORE opening Razorpay
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const orderInsert = {
            id: orderUuid, // Use UUID for database
            user_id: user.id,
            items: cartItems,
            shipping: calculateShipping(),
            subtotal: calculateSubtotal(),
            tax: calculateTax(),
            total_amount: calculateTotal(),
            payment_method: "razorpay",
            payment_status: "pending",
            order_number: orderNumber,
            status: "pending",
            shipping_address: getSelectedShippingAddress(),
            razorpay_order_id: razorpayOrderId, // Store Razorpay's ID separately
          };

          const { error: insertError } = await supabase
            .from("orders")
            .insert([orderInsert]);

          if (insertError) {
            console.error("Failed to save order:", insertError);
            throw insertError;
          }

          // Now open Razorpay with the existing order data
          await openRazorpayCheckout(razorpayOrderId, data.amount, orderUuid);
        }
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error("Failed to create order. Please try again.");
      setIsProcessing(false);
    }
  };

  const openRazorpayCheckout = async (
    razorpayOrderId: string,
    amount: number,
    orderUuid: string
  ) => {
    const res = await loadRazorpayScript();
    if (!res) {
      console.error("Razorpay SDK failed to load");
      toast.error("Payment system unavailable. Please try again later.");
      setIsProcessing(false);
      return;
    }

    // Get user info
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please login to continue");
      navigate("/login");
      setIsProcessing(false);
      return;
    }

    console.log("Opening Razorpay for order:", orderUuid);

    const options = {
      key: "rzp_test_D9dAx2VAFdzlHt",
      amount: amount.toString(),
      currency: "INR",
      name: "SilverQala",
      description: "Jewellery Purchase",
      image: LogoTitle,
      order_id: razorpayOrderId,
      handler: async function (response: any) {
        console.log("Razorpay response:", response);

        try {
          // Verify payment with your backend
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session) {
            toast.error("User session expired. Please login again.");
            navigate("/login");
            setIsProcessing(false);
            return;
          }
          const verifyRes = await axios.post(
            "https://jeokcwaellvizdaoywze.supabase.co/functions/v1/verify-payment",
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          console.log("Verification response:", verifyRes.data);

          if (verifyRes.data.success) {
            // Update order status
            const { error: updateError } = await supabase
              .from("orders")
              .update({
                payment_status: "paid",
                status: "processing",
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                updated_at: new Date().toISOString(),
              })
              .eq("id", orderUuid);

            if (updateError) {
              console.error("Failed to update order:", updateError);
              throw updateError;
            }

            console.log("Order updated successfully, clearing cart...");

            // Clear cart
            clearCart();

            // Navigate to confirmation page
            console.log(
              "Navigating to confirmation:",
              `/order-confirmation/${orderUuid}`
            );
            navigate(`/order-confirmation/${orderUuid}`);
          } else {
            throw new Error("Payment verification failed");
          }
        } catch (error) {
          console.error("Payment processing error:", error);
          toast.error("Payment verification failed. Please contact support.");

          // Try to update order as failed
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
              status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderUuid);

          setIsProcessing(false);
        }
      },
      prefill: {
        name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        email: shippingAddress.email,
        contact: shippingAddress.phone,
      },
      theme: {
        color: "#1a1a1a",
      },
      modal: {
        ondismiss: function () {
          console.log("Razorpay modal dismissed");
          setIsProcessing(false);
          toast.info("Payment cancelled.");
        },
      },
    };

    try {
      // @ts-ignore
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);

        // Update order as failed
        supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", razorpayOrderId);

        setIsProcessing(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Failed to open Razorpay:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setIsProcessing(false);
    }
  };
  // Handle Cash on Delivery
  const handleCashOnDelivery = async () => {
    setIsProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const orderUuid = uuidv4();
        const orderNumber = `COD${Date.now().toString().slice(-8)}`;

        const orderInsert = {
          id: orderUuid,
          user_id: user.id,
          items: cartItems,
          shipping: calculateShipping(),
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          total_amount: calculateTotal(),
          payment_method: "cod",
          payment_status: "pending",
          order_number: orderNumber,
          status: "pending",
          shipping_address: getSelectedShippingAddress(),
        };

        const { error: insertError } = await supabase
          .from("orders")
          .insert([orderInsert])
          .select()
          .single();

        if (insertError) throw insertError;

        // Clear cart and navigate
        clearCart();
        navigate(`/order-confirmation/${orderUuid}`);
      }
    } catch (error) {
      console.error("COD order creation failed:", error);
      toast.error("Failed to place COD order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedShippingAddress = () => {
    if (showNewAddressForm) {
      return shippingAddress;
    }
    const selected = savedAddresses.find(
      (addr) => addr.id === selectedAddressId
    );
    return selected || shippingAddress;
  };

  const handleSaveNewAddress = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please login to save address");
        return;
      }

      // Validate required fields
      if (
        !shippingAddress.first_name ||
        !shippingAddress.email ||
        !shippingAddress.phone ||
        !shippingAddress.address
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      const addressObj = {
        ...shippingAddress,
        id: uuidv4(),
        is_default: savedAddresses.length === 0,
      };

      const updatedAddresses = [...savedAddresses, addressObj];

      const { error } = await supabase
        .from("profiles")
        .update({ shipping_addresses: updatedAddresses })
        .eq("id", user.id);

      if (error) {
        console.error("Error saving address:", error);
        toast.error("Failed to save address. Please try again.");
        return;
      }

      setSavedAddresses(updatedAddresses);
      setSelectedAddressId(addressObj.id);
      setShowNewAddressForm(false);
      toast.success("Address saved successfully");
    } catch (error) {
      console.error("Error in handleSaveNewAddress:", error);
      toast.error("Failed to save address");
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 10, md: 16 }, px: 3 }}>
        <Box textAlign="center">
          <ShoppingBagIcon
            sx={{
              fontSize: { xs: 60, md: 80 },
              color: "text.disabled",
              mb: { xs: 3, md: 4 },
              opacity: 0.3,
            }}
          />
          <Typography
            variant="h4"
            fontWeight={600}
            gutterBottom
            sx={{ mb: 2, fontSize: { xs: "1.5rem", md: "2rem" } }}
          >
            Your cart is empty
          </Typography>
          <Typography
            color="text.secondary"
            paragraph
            sx={{ mb: { xs: 4, md: 5 }, fontSize: { xs: 14, md: 16 } }}
          >
            Add beautiful jewellery pieces to your cart
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/all-jewellery")}
            sx={{
              px: { xs: 4, md: 5 },
              py: 1.5,
              borderRadius: 50,
              bgcolor: "#c9a87c",
              "&:hover": {
                bgcolor: "#b8986a",
                transform: "translateY(-2px)",
                boxShadow: `0 8px 20px ${alpha("#c9a87c", 0.3)}`,
              },
              textTransform: "none",
              fontSize: { xs: 14, md: 16 },
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
          >
            Browse Collection
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#FAFAF8", minHeight: "100vh" }}>
      {/* Minimal Header */}
      <Box
        sx={{
          borderBottom: `1px solid ${alpha("#4A3B2A", 0.08)}`,
          bgcolor: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              py: { xs: 1.5, md: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={() => navigate(-1)}
                size="small"
                sx={{ color: "#4A3B2A" }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1rem", md: "1.125rem" },
                  color: "#4A3B2A",
                  letterSpacing: "-0.01em",
                }}
              >
                Checkout
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LockIcon sx={{ fontSize: 14, color: "#4A3B2A", opacity: 0.6 }} />
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#4A3B2A",
                  opacity: 0.6,
                  fontWeight: 500,
                }}
              >
                Secure
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 } }}
      >
        {/* Minimal Stepper */}
        <Box sx={{ mb: { xs: 4, md: 5 }, maxWidth: 400, mx: "auto" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0}
          >
            {steps.map((label, index) => (
              <React.Fragment key={label}>
                <Stack alignItems="center" spacing={0.75}>
                  <StepIcon active={index <= activeStep}>
                    {index < activeStep ? "✓" : index + 1}
                  </StepIcon>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: index <= activeStep ? 600 : 400,
                      color: index <= activeStep ? "#4A3B2A" : "text.disabled",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {label}
                  </Typography>
                </Stack>
                {index < steps.length - 1 && (
                  <Box
                    sx={{
                      width: { xs: 50, md: 80 },
                      height: 1,
                      bgcolor:
                        index < activeStep ? "#4A3B2A" : alpha("#4A3B2A", 0.15),
                      mx: 2,
                      mt: -2,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </Stack>
        </Box>

        <Grid container spacing={{ xs: 3, md: 5 }}>
          {/* Left Column - Checkout Steps */}
          <Grid item xs={12} lg={7}>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                border: `1px solid ${alpha("#4A3B2A", 0.08)}`,
                p: { xs: 2.5, md: 4 },
              }}
            >
              {/* Step 1: Shipping Address */}
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionWrapper>
                      <SectionTitle>Delivery Address</SectionTitle>

                      {savedAddresses.length > 0 && !showNewAddressForm && (
                        <Stack spacing={2} sx={{ mb: 3 }}>
                          {savedAddresses.map((address) => (
                            <AddressCard
                              key={address.id}
                              selected={selectedAddressId === address.id}
                              onClick={() => setSelectedAddressId(address.id)}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="flex-start"
                              >
                                <Radio
                                  checked={selectedAddressId === address.id}
                                  size="small"
                                  sx={{
                                    p: 0,
                                    color: alpha("#4A3B2A", 0.3),
                                    "&.Mui-checked": { color: "#4A3B2A" },
                                  }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    sx={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      color: "#4A3B2A",
                                      mb: 0.5,
                                    }}
                                  >
                                    {address.first_name} {address.last_name}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 13,
                                      color: "text.secondary",
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {address.address}, {address.city},{" "}
                                    {address.state} - {address.zip_code}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "text.secondary",
                                      mt: 0.75,
                                    }}
                                  >
                                    {address.phone}
                                  </Typography>
                                </Box>
                              </Stack>
                            </AddressCard>
                          ))}
                        </Stack>
                      )}

                      {!showNewAddressForm && savedAddresses.length > 0 && (
                        <Button
                          variant="text"
                          onClick={() => setShowNewAddressForm(true)}
                          sx={{
                            color: "#4A3B2A",
                            textTransform: "none",
                            fontSize: 13,
                            fontWeight: 500,
                            p: 0,
                            "&:hover": {
                              bgcolor: "transparent",
                              textDecoration: "underline",
                            },
                          }}
                        >
                          + Add new address
                        </Button>
                      )}

                      {/* New Address Form */}
                      {(showNewAddressForm || savedAddresses.length === 0) && (
                        <Box sx={{ mt: savedAddresses.length > 0 ? 3 : 0 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <MinimalTextField
                                fullWidth
                                label="First Name"
                                value={shippingAddress.first_name}
                                onChange={(e) =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    first_name: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <MinimalTextField
                                fullWidth
                                label="Last Name"
                                value={shippingAddress.last_name}
                                onChange={(e) =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    last_name: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <MinimalTextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={shippingAddress.email}
                                onChange={(e) =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    email: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <MinimalTextField
                                fullWidth
                                label="Phone"
                                value={shippingAddress.phone}
                                onChange={(e) =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    phone: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <MinimalTextField
                                fullWidth
                                label="Address"
                                multiline
                                rows={2}
                                value={shippingAddress.address}
                                onChange={(e) =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    address: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <MinimalTextField
                                fullWidth
                                label="City"
                                value={shippingAddress.city}
                                onChange={(e) =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    city: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <MinimalTextField
                                fullWidth
                                label="State"
                                value={shippingAddress.state}
                                onChange={(e) =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    state: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <MinimalTextField
                                fullWidth
                                label="PIN Code"
                                value={shippingAddress.zip_code}
                                onChange={(e) =>
                                  setShippingAddress({
                                    ...shippingAddress,
                                    zip_code: e.target.value,
                                  })
                                }
                                size="small"
                              />
                            </Grid>
                          </Grid>
                          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                            <Button
                              onClick={handleSaveNewAddress}
                              disabled={
                                !shippingAddress.first_name ||
                                !shippingAddress.email ||
                                !shippingAddress.phone ||
                                !shippingAddress.address
                              }
                              sx={{
                                bgcolor: "#4A3B2A",
                                color: "#fff",
                                textTransform: "none",
                                px: 3,
                                py: 1,
                                fontSize: 13,
                                fontWeight: 500,
                                borderRadius: 1.5,
                                "&:hover": { bgcolor: "#3d3124" },
                                "&:disabled": {
                                  bgcolor: alpha("#4A3B2A", 0.3),
                                },
                              }}
                            >
                              Save Address
                            </Button>
                            {savedAddresses.length > 0 && (
                              <Button
                                variant="text"
                                onClick={() => setShowNewAddressForm(false)}
                                sx={{
                                  color: "text.secondary",
                                  textTransform: "none",
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      )}
                    </SectionWrapper>

                    <Divider
                      sx={{ my: 3, borderColor: alpha("#4A3B2A", 0.08) }}
                    />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Button
                        onClick={() => navigate(-1)}
                        sx={{
                          color: "text.secondary",
                          textTransform: "none",
                          fontSize: 13,
                        }}
                        startIcon={<ArrowBackIcon fontSize="small" />}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setActiveStep(1)}
                        disabled={!selectedAddressId && !showNewAddressForm}
                        sx={{
                          bgcolor: "#4A3B2A",
                          color: "#fff",
                          textTransform: "none",
                          px: 4,
                          py: 1.25,
                          fontSize: 14,
                          fontWeight: 500,
                          borderRadius: 1.5,
                          "&:hover": { bgcolor: "#3d3124" },
                          "&:disabled": { bgcolor: alpha("#4A3B2A", 0.3) },
                        }}
                      >
                        Continue
                      </Button>
                    </Stack>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 2: Payment */}
              <AnimatePresence mode="wait">
                {activeStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SectionWrapper>
                      <SectionTitle>Payment Method</SectionTitle>

                      <Stack spacing={1.5} sx={{ mb: 4 }}>
                        <PaymentOption
                          selected={paymentMethod === "card"}
                          onClick={() => setPaymentMethod("card")}
                        >
                          <Radio
                            checked={paymentMethod === "card"}
                            size="small"
                            sx={{
                              p: 0,
                              color: alpha("#4A3B2A", 0.3),
                              "&.Mui-checked": { color: "#4A3B2A" },
                            }}
                          />
                          <CreditCardIcon
                            sx={{ fontSize: 20, color: "#4A3B2A" }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#4A3B2A",
                              }}
                            >
                              Card / UPI / Net Banking
                            </Typography>
                            <Typography
                              sx={{ fontSize: 12, color: "text.secondary" }}
                            >
                              Pay securely via Razorpay
                            </Typography>
                          </Box>
                          <ShieldIcon
                            sx={{ fontSize: 16, color: alpha("#4A3B2A", 0.4) }}
                          />
                        </PaymentOption>

                        <PaymentOption
                          selected={paymentMethod === "cod"}
                          onClick={() => setPaymentMethod("cod")}
                        >
                          <Radio
                            checked={paymentMethod === "cod"}
                            size="small"
                            sx={{
                              p: 0,
                              color: alpha("#4A3B2A", 0.3),
                              "&.Mui-checked": { color: "#4A3B2A" },
                            }}
                          />
                          <ShoppingBagIcon
                            sx={{ fontSize: 20, color: "#4A3B2A" }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#4A3B2A",
                              }}
                            >
                              Cash on Delivery
                            </Typography>
                            <Typography
                              sx={{ fontSize: 12, color: "text.secondary" }}
                            >
                              Pay when you receive
                            </Typography>
                          </Box>
                        </PaymentOption>
                      </Stack>
                    </SectionWrapper>

                    {/* Order Summary in Payment Step */}
                    <SectionWrapper>
                      <SectionTitle>Order Summary</SectionTitle>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography
                            sx={{ fontSize: 13, color: "text.secondary" }}
                          >
                            Subtotal
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                            ₹{calculateSubtotal().toLocaleString()}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography
                            sx={{ fontSize: 13, color: "text.secondary" }}
                          >
                            Shipping
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color:
                                calculateShipping() === 0
                                  ? "#2e7d32"
                                  : "inherit",
                            }}
                          >
                            {calculateShipping() === 0
                              ? "Free"
                              : `₹${calculateShipping()}`}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography
                            sx={{ fontSize: 13, color: "text.secondary" }}
                          >
                            Tax (18% GST)
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                            ₹{calculateTax().toLocaleString()}
                          </Typography>
                        </Stack>
                        <Divider
                          sx={{ my: 1, borderColor: alpha("#4A3B2A", 0.1) }}
                        />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#4A3B2A",
                            }}
                          >
                            Total
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#4A3B2A",
                            }}
                          >
                            ₹{calculateTotal().toLocaleString()}
                          </Typography>
                        </Stack>
                      </Stack>
                    </SectionWrapper>

                    <Divider
                      sx={{ my: 3, borderColor: alpha("#4A3B2A", 0.08) }}
                    />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Button
                        onClick={() => setActiveStep(0)}
                        sx={{
                          color: "text.secondary",
                          textTransform: "none",
                          fontSize: 13,
                        }}
                        startIcon={<ArrowBackIcon fontSize="small" />}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={
                          paymentMethod === "card"
                            ? handleCreateOrder
                            : handleCashOnDelivery
                        }
                        disabled={isProcessing}
                        sx={{
                          bgcolor: "#4A3B2A",
                          color: "#fff",
                          textTransform: "none",
                          px: 4,
                          py: 1.25,
                          fontSize: 14,
                          fontWeight: 500,
                          borderRadius: 1.5,
                          "&:hover": { bgcolor: "#3d3124" },
                          "&:disabled": { bgcolor: alpha("#4A3B2A", 0.5) },
                        }}
                        startIcon={
                          isProcessing ? (
                            <CircularProgress
                              size={16}
                              sx={{ color: "#fff" }}
                            />
                          ) : (
                            <LockIcon sx={{ fontSize: 16 }} />
                          )
                        }
                      >
                        {isProcessing
                          ? "Processing..."
                          : `Pay ₹${calculateTotal().toLocaleString()}`}
                      </Button>
                    </Stack>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} lg={5}>
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 2,
                border: `1px solid ${alpha("#4A3B2A", 0.08)}`,
                p: { xs: 2.5, md: 3 },
                position: { lg: "sticky" },
                top: { lg: 100 },
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "text.secondary",
                  mb: 2.5,
                  pb: 1.5,
                  borderBottom: `1px solid ${alpha("#4A3B2A", 0.08)}`,
                }}
              >
                Your Order ({cartItems.length}{" "}
                {cartItems.length === 1 ? "item" : "items"})
              </Typography>

              {/* Cart Items - Minimal */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                {cartItems.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 1.5,
                        overflow: "hidden",
                        border: `1px solid ${alpha("#4A3B2A", 0.1)}`,
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={
                          (item as any).image_url ||
                          (item as any).image ||
                          undefined
                        }
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#4A3B2A",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 12, color: "text.secondary" }}
                      >
                        Qty: {item.quantity}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 600, color: "#4A3B2A" }}
                    >
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ borderColor: alpha("#4A3B2A", 0.08), mb: 2.5 }} />

              {/* Price Summary */}
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Subtotal
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    ₹{calculateSubtotal().toLocaleString()}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Shipping
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: calculateShipping() === 0 ? "#2e7d32" : "inherit",
                    }}
                  >
                    {calculateShipping() === 0
                      ? "Free"
                      : `₹${calculateShipping()}`}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Tax (18%)
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    ₹{calculateTax().toLocaleString()}
                  </Typography>
                </Stack>
              </Stack>

              <Box
                sx={{
                  mt: 2.5,
                  pt: 2.5,
                  borderTop: `1px solid ${alpha("#4A3B2A", 0.1)}`,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, color: "#4A3B2A" }}
                  >
                    Total
                  </Typography>
                  <Typography
                    sx={{ fontSize: 18, fontWeight: 700, color: "#4A3B2A" }}
                  >
                    ₹{calculateTotal().toLocaleString()}
                  </Typography>
                </Stack>
              </Box>

              {/* Trust Indicators */}
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  mt: 3,
                  pt: 2.5,
                  borderTop: `1px solid ${alpha("#4A3B2A", 0.06)}`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <ShippingIcon
                    sx={{ fontSize: 14, color: alpha("#4A3B2A", 0.5) }}
                  />
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    Free Delivery
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <LockIcon
                    sx={{ fontSize: 14, color: alpha("#4A3B2A", 0.5) }}
                  />
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    Secure
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <CheckCircleIcon
                    sx={{ fontSize: 14, color: alpha("#4A3B2A", 0.5) }}
                  />
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    Easy Returns
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Checkout;
