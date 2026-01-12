import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  ShoppingBag,
  ArrowBack,
  Receipt,
  CalendarToday,
  LocalShipping,
  Payment,
} from "@mui/icons-material";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "sonner";
import { styled } from "@mui/material/styles";

const StatusChip = styled(Chip)(() => ({
  fontWeight: 500,
  fontSize: "0.75rem",
}));

const OrderRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
  },
}));

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
};

type ShippingAddress = {
  fullName?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  zip_code?: string;
  country: string;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: "card" | "cod"; // ✅ only these two strings allowed
  payment_status: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  created_at: string;
  shipping_address: ShippingAddress;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        const parsedOrders: Order[] = (ordersData || []).map((order: any) => {
          let shipping_address: ShippingAddress = {
            email: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            country: "IN",
          };

          if (order?.shipping_address) {
            if (typeof order.shipping_address === "string") {
              try {
                const parsed = JSON.parse(order.shipping_address);
                shipping_address = {
                  fullName: parsed.fullName || "",
                  first_name: parsed.first_name || "",
                  last_name: parsed.last_name || "",
                  email: parsed.email || "",
                  phone: parsed.phone || "",
                  address: parsed.address || "",
                  city: parsed.city || "",
                  state: parsed.state || "",
                  zipCode: parsed.zipCode || parsed.zip_code || "",
                  country: parsed.country || "IN",
                };
              } catch (error) {
                console.error("Error parsing shipping address:", error);
              }
            } else if (typeof order.shipping_address === "object") {
              shipping_address = order.shipping_address;
            }
          }

          let items: OrderItem[] = [];
          if (order?.items) {
            try {
              items =
                typeof order.items === "string"
                  ? JSON.parse(order.items)
                  : order.items;
            } catch (error) {
              console.error("Error parsing items:", error);
            }
          }

          const paymentMethod: "card" | "cod" =
            order.payment_method === "razorpay" ? "card" : "cod";

          return {
            id: order.id,
            order_number:
              order.order_number || `ORD-${order.id.slice(-8).toUpperCase()}`,
            status: order.status || "pending",
            total_amount: order.total_amount || 0,
            payment_method: paymentMethod,
            payment_status: order.payment_status || "pending",
            items,
            subtotal: order.subtotal || 0,
            tax: order.tax || 0,
            shipping: order.shipping || 0,
            created_at: order.created_at,
            shipping_address,
            razorpay_order_id: order.razorpay_order_id,
            razorpay_payment_id: order.razorpay_payment_id,
            razorpay_signature: order.razorpay_signature,
          };
        });

        setOrders(parsedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleBackToList = () => {
    setSelectedOrder(null);
    setViewMode("list");
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "primary";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">Loading your orders...</Typography>
        </Stack>
      </Box>
    );
  }

  if (viewMode === "detail" && selectedOrder) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToList}
          sx={{ mb: 3 }}
        >
          Back to Orders
        </Button>

        <OrderDetailView order={selectedOrder} />
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <ShoppingBag sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Orders Yet
          </Typography>
          <Typography color="text.secondary" paragraph sx={{ mb: 4 }}>
            You haven't placed any orders yet. Start shopping to see your orders
            here.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/all-jewellery")}
            startIcon={<ShoppingBag />}
          >
            Browse Products
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight={500}>
          My Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {orders.length} order{orders.length !== 1 ? "s" : ""} found
        </Typography>
      </Stack>

      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <OrderRow key={order.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {order.order_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(order.created_at)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.items.length} item
                    {order.items.length !== 1 ? "s" : ""}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    ₹{order.total_amount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip
                    label={order.status.toUpperCase()}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {order.payment_method === "card" ? "Card" : "COD"}
                    </Typography>
                    <StatusChip
                      label={order.payment_status.toUpperCase()}
                      color={getPaymentStatusColor(order.payment_status)}
                      size="small"
                    />
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    startIcon={<Receipt />}
                    sx={{ ml: 1 }}
                  >
                    View Details
                  </Button>
                </TableCell>
              </OrderRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

// Order Detail View Component
const OrderDetailView = ({ order }: { order: Order }) => {
  const navigate = useNavigate();
  const getFullName = () => {
    if (order.shipping_address.fullName) {
      return order.shipping_address.fullName;
    }
    if (order.shipping_address.first_name || order.shipping_address.last_name) {
      return `${order.shipping_address.first_name || ""} ${
        order.shipping_address.last_name || ""
      }`.trim();
    }
    return "Customer";
  };
  const handleNavigator = () => {
    navigate("/all-jewellery");
  };

  const getAddressLine = () => {
    const addr = order.shipping_address;
    const parts = [
      addr.address,
      addr.city,
      addr.state,
      addr.zipCode || addr.zip_code,
      addr.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid component="div" item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={500}>
                Order Items ({order.items.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                {order.items.map((item, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2 }}
                  >
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={2}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            bgcolor: "action.hover",
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <ShoppingBag color="action" />
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={5}>
                        <Typography variant="body1" fontWeight={500}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SKU: {item.id.slice(0, 8)}
                        </Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2" color="text.secondary">
                          Qty: {item.quantity}
                        </Typography>
                      </Grid>
                      <Grid item xs={1}>
                        <Typography variant="body2" color="text.secondary">
                          ₹{item.price.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} textAlign="right">
                        <Typography variant="body1" fontWeight={600}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Order Summary */}
              <Box sx={{ maxWidth: 400, ml: "auto" }}>
                <Typography variant="h6" gutterBottom fontWeight={500}>
                  Order Summary
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography>₹{order.subtotal.toFixed(2)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Shipping</Typography>
                    <Typography
                      color={order.shipping === 0 ? "success.main" : "inherit"}
                    >
                      {order.shipping === 0
                        ? "FREE"
                        : `₹${order.shipping.toFixed(2)}`}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Tax (18%)</Typography>
                    <Typography>₹{order.tax.toFixed(2)}</Typography>
                  </Stack>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6">Total Amount</Typography>
                    <Typography variant="h6" color="primary">
                      ₹{order.total_amount.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping & Payment Info */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Shipping Address */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <LocalShipping color="primary" />
                  <Typography variant="h6" fontWeight={500}>
                    Shipping Address
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Typography variant="body1" fontWeight={500}>
                    {getFullName()}
                  </Typography>
                  <Typography variant="body2">{getAddressLine()}</Typography>
                  <Typography variant="body2">
                    📞 {order.shipping_address.phone || "Not provided"}
                  </Typography>
                  <Typography variant="body2">
                    ✉️ {order.shipping_address.email || "Not provided"}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Payment color="primary" />
                  <Typography variant="h6" fontWeight={500}>
                    Payment Information
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Method
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {order.payment_method === "card"
                        ? "Credit/Debit Card"
                        : "Cash on Delivery"}
                    </Typography>
                  </Stack>
                  {order.razorpay_payment_id && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Payment ID
                      </Typography>
                      <Typography variant="body2" fontSize="0.8rem">
                        {order.razorpay_payment_id}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6" fontWeight={500}>
                    Order Timeline
                  </Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Order Placed
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
        <Button
          variant="contained"
          onClick={() => window.print()}
          startIcon={<Receipt />}
        >
          Print Invoice
        </Button>
        <Button
          variant="outlined"
          onClick={handleNavigator}
          startIcon={<ShoppingBag />}
        >
          Continue Shopping
        </Button>
      </Stack>
    </Box>
  );
};

export default OrdersPage;
