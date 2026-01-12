import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Divider,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Paper,
  alpha,
} from "@mui/material";
import {
  CheckCircle,
  LocalShipping,
  ShoppingBag,
  ArrowBack,
  Person,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
  Receipt,
  Payment,
  ArrowForward,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { supabase } from "../integrations/supabase/client";

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!orderId) {
          throw new Error("No order ID provided");
        }

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (error) {
          const { data: orderNumberData, error: orderNumberError } =
            await supabase
              .from("orders")
              .select("*")
              .eq("order_number", orderId)
              .single();

          if (orderNumberError) {
            const { data: razorpayData } = await supabase
              .from("orders")
              .select("*")
              .eq("razorpay_order_id", orderId)
              .single();

            if (razorpayData) {
              setOrder(razorpayData);
            } else {
              throw new Error("Order not found");
            }
          } else {
            setOrder(orderNumberData);
          }
        } else {
          setOrder(data);
        }
      } catch (err: any) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        sx={{ bgcolor: "rgb(246, 242, 238)" }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Loading order details...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 8, bgcolor: "rgb(246, 242, 238)", minHeight: "100vh" }}
      >
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            boxShadow: "none",
          }}
        >
          <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
            Order Not Found
          </Alert>
          <Typography color="text.secondary" paragraph>
            {error || "We couldn't find your order details."}
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => navigate("/orders")}
              startIcon={<ArrowBack />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
              }}
            >
              View Orders
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/all-jewellery")}
              endIcon={<ArrowForward />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
              }}
            >
              Continue Shopping
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const items =
    typeof order.items === "string"
      ? JSON.parse(order.items)
      : order.items || [];
  const shippingAddress =
    typeof order.shipping_address === "string"
      ? JSON.parse(order.shipping_address)
      : order.shipping_address || {};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "rgb(246, 242, 238)",
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              mb: 4,
              textAlign: "center",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                color: "white",
                fontSize: 32,
              }}
            >
              <CheckCircle fontSize="inherit" />
            </Box>
            <Typography variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
              Order Confirmed!
            </Typography>
            <Typography
              variant="subtitle1"
              color="primary"
              sx={{ mb: 2, fontWeight: 500 }}
            >
              Order #
              {order.order_number || order.id.substring(0, 8).toUpperCase()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thank you for your purchase. A confirmation email has been sent to{" "}
              {shippingAddress.email || "your email"}.
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {/* Order Summary */}
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                height: "100%",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={4}>
                <Receipt color="primary" />
                <Typography variant="h6" fontWeight={500}>
                  Order Details
                </Typography>
              </Box>

              <Stack spacing={3}>
                {items.map((item: any, index: number) => (
                  <Box
                    key={index}
                    onClick={() => navigate(`/product/${item.id}`)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      p: 2,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: alpha("#fff", 0.5),
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: alpha("#fff", 0.8),
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={item.image_url || item.image || ""}
                      alt={item.name}
                      sx={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                      onError={(e: any) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <Box flex={1}>
                      <Typography variant="body1" fontWeight={500} gutterBottom>
                        {item.name}
                      </Typography>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {item.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: ₹{item.price?.toFixed(2)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 4 }} />

              {/* Price Summary */}
              <Box sx={{ maxWidth: 400, ml: "auto" }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography>
                      ₹{order.subtotal?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Shipping</Typography>
                    <Typography
                      color={order.shipping === 0 ? "success.main" : "inherit"}
                    >
                      {order.shipping === 0
                        ? "Free"
                        : `₹${order.shipping?.toFixed(2) || "0.00"}`}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="text.secondary">Tax (18%)</Typography>
                    <Typography>₹{order.tax?.toFixed(2) || "0.00"}</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={600}>
                      Total Amount
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={600}>
                      ₹{order.total_amount?.toFixed(2) || "0.00"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* Shipping & Payment Info */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Shipping Info */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <LocalShipping color="primary" />
                  <Typography variant="h6" fontWeight={500}>
                    Shipping Details
                  </Typography>
                </Box>
                <Stack spacing={2.5}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2">
                      {shippingAddress.first_name} {shippingAddress.last_name}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">
                      {shippingAddress.phone || "Not provided"}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Email fontSize="small" color="action" />
                    <Typography variant="body2">
                      {shippingAddress.email || "Not provided"}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={2}>
                    <LocationOn
                      fontSize="small"
                      color="action"
                      sx={{ mt: 0.5 }}
                    />
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        {shippingAddress.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {shippingAddress.city}, {shippingAddress.state} -{" "}
                        {shippingAddress.zip_code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {shippingAddress.country}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {/* Payment Info */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <Payment color="primary" />
                  <Typography variant="h6" fontWeight={500}>
                    Payment Details
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Method
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {order.payment_method === "razorpay"
                        ? "Credit/Debit Card"
                        : order.payment_method === "cod"
                        ? "Cash on Delivery"
                        : order.payment_method?.toUpperCase() || "N/A"}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={order.payment_status?.toUpperCase() || "PENDING"}
                      color={
                        order.payment_status === "paid"
                          ? "success"
                          : order.payment_status === "failed"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Order Status
                    </Typography>
                    <Chip
                      label={order.status?.toUpperCase() || "PROCESSING"}
                      color={
                        order.status === "delivered"
                          ? "success"
                          : order.status === "shipped"
                          ? "info"
                          : order.status === "processing"
                          ? "primary"
                          : "default"
                      }
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Order Timeline */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6" fontWeight={500}>
                    Order Timeline
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Order Placed
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(order.created_at)}
                    </Typography>
                  </Box>
                  {order.updated_at &&
                    order.updated_at !== order.created_at && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(order.updated_at)}
                        </Typography>
                      </Box>
                    )}
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="center" gap={2} mt={4}>
          <Button
            variant="outlined"
            onClick={() => navigate("/orders")}
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 4,
              py: 1.5,
              minWidth: 180,
              borderWidth: 1.5,
            }}
          >
            View All Orders
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/all-jewellery")}
            endIcon={<ShoppingBag />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 4,
              py: 1.5,
              minWidth: 180,
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            Continue Shopping
          </Button>
        </Box>

        <Box
          sx={{
            p: 3,
            mt: 4,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle1" gutterBottom fontWeight={500}>
            Need Help?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For any questions about your order, contact our customer support at{" "}
            <Box component="span" fontWeight={500}>
              support@silverqala.com
            </Box>{" "}
            or call{" "}
            <Box component="span" fontWeight={500}>
              +91 9876543210
            </Box>
            .
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default OrderConfirmation;
