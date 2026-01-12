import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../integrations/supabase/client";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  SearchOutlined,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  payment_method?: string;
  card_last_four?: string | null;
  card_expiry?: string | null;
  shipping_address?: any;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
    image_url?: string | null;
  }>;
  coupon_code?: string | null;
  discount_amount?: number;
  discount_type?: string | null;
  profiles?: {
    email: string;
  };
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  total_revenue: number;
}

const ITEMS_PER_PAGE = 10;

const AllOrdersManager = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    total_revenue: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `order_number.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`
        );
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Parse the data similar to the working code
      const parsedOrders: Order[] =
        data?.map((order: any) => {
          // Extract shipping address fields if present
          const shipping = order.shipping_address || {};
          return {
            id: order.id,
            order_number: order.order_number,
            total_amount: order.total_amount ?? 0,
            status: order.status ?? "pending",
            created_at: order.created_at ?? "",
            updated_at: order.updated_at ?? "",
            user_id: order.user_id ?? "",
            first_name: shipping.first_name ?? order.first_name ?? "",
            last_name: shipping.last_name ?? order.last_name ?? "",
            email: shipping.email ?? order.email ?? "",
            phone: shipping.phone ?? order.phone ?? "",
            address: shipping.address ?? order.address ?? "",
            city: shipping.city ?? order.city ?? "",
            state: shipping.state ?? order.state ?? "",
            zip_code: shipping.zip_code ?? order.zip_code ?? "",
            country: shipping.country ?? order.country ?? "",
            payment_method: order.payment_method ?? "",
            card_last_four: order.card_last_four ?? null,
            card_expiry: order.card_expiry ?? null,
            shipping_address: order.shipping_address,
            items:
              typeof order.items === "string"
                ? JSON.parse(order.items)
                : order.items ?? [],
            coupon_code: order.coupon_code ?? null,
            discount_amount: order.discount_amount ?? 0,
            discount_type: order.discount_type ?? null,
          };
        }) || [];

      setOrders(parsedOrders);
      setTotalOrders(count || 0);

      // Fetch all orders for stats calculation (without pagination)
      await fetchAllOrdersForStats();
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllOrdersForStats = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("status, total_amount");

      if (error) throw error;

      const allOrders = data || [];
      const newStats: OrderStats = {
        total: allOrders.length,
        pending: allOrders.filter((o) => o.status === "pending").length,
        processing: allOrders.filter((o) => o.status === "processing").length,
        shipped: allOrders.filter((o) => o.status === "shipped").length,
        delivered: allOrders.filter((o) => o.status === "delivered").length,
        cancelled: allOrders.filter((o) => o.status === "cancelled").length,
        total_revenue: allOrders.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ),
      };
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Refresh orders after status update
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "processing":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleExpandRow = (orderId: string) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Orders: All Orders
        </Typography>
        <Chip
          label={`Total: ${totalOrders}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Orders
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              All time orders
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Processing
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {stats.processing}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Orders in process
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Shipped
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {stats.shipped}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Orders in transit
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {formatCurrency(stats.total_revenue)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              All time revenue
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by Order Number or Order ID"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Orders will appear here once customers place orders"}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.N.</TableCell>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Update Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, index) => (
                  <>
                    <TableRow key={order.id} hover>
                      <TableCell>
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{
                            maxWidth: 150,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {order.order_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.first_name && order.last_name
                            ? `${order.first_name} ${order.last_name}`
                            : order.email || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(order.total_amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status || "Unknown"}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(order.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="processing">Processing</MenuItem>
                            <MenuItem value="shipped">Shipped</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleExpandRow(order.id)}
                        >
                          {expandedRow === order.id ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={8}
                      >
                        <Collapse
                          in={expandedRow === order.id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box sx={{ margin: 2 }}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              spacing={3}
                            >
                              {/* Shipping Information */}
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  gutterBottom
                                  component="div"
                                  fontWeight={600}
                                >
                                  Shipping Information
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                  <Stack spacing={1}>
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Name
                                      </Typography>
                                      <Typography variant="body2">
                                        {order.first_name} {order.last_name}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Address
                                      </Typography>
                                      <Typography variant="body2">
                                        {order.address}
                                      </Typography>
                                      <Typography variant="body2">
                                        {order.city}, {order.state}{" "}
                                        {order.zip_code}
                                      </Typography>
                                      <Typography variant="body2">
                                        {order.country}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Email
                                      </Typography>
                                      <Typography variant="body2">
                                        {order.email}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Phone
                                      </Typography>
                                      <Typography variant="body2">
                                        {order.phone}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Paper>
                              </Box>

                              {/* Payment & Order Items */}
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="subtitle2"
                                  gutterBottom
                                  component="div"
                                  fontWeight={600}
                                >
                                  Payment Information
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                  <Stack spacing={1}>
                                    <Box>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Payment Method
                                      </Typography>
                                      <Typography variant="body2">
                                        {order.payment_method}
                                        {order.card_last_four &&
                                          ` ending in ${order.card_last_four}`}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Paper>

                                {/* Order Items */}
                                {order.items && order.items.length > 0 && (
                                  <>
                                    <Typography
                                      variant="subtitle2"
                                      gutterBottom
                                      component="div"
                                      fontWeight={600}
                                      sx={{ mt: 2 }}
                                    >
                                      Order Items
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                      <Stack spacing={2}>
                                        {order.items.map((item, idx) => (
                                          <Box
                                            key={idx}
                                            sx={{
                                              display: "flex",
                                              gap: 2,
                                              alignItems: "center",
                                              cursor: "pointer",
                                              p: 1,
                                              borderRadius: 1,
                                              transition: "all 0.2s",
                                              "&:hover": {
                                                bgcolor: "grey.50",
                                                transform: "translateX(4px)",
                                              },
                                            }}
                                            onClick={() =>
                                              navigate(`/product/${item.id}`)
                                            }
                                          >
                                            <Box
                                              sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: 1,
                                                overflow: "hidden",
                                                bgcolor: "grey.100",
                                                flexShrink: 0,
                                                border: "1px solid",
                                                borderColor: "grey.200",
                                              }}
                                            >
                                              {item.image || item.image_url ? (
                                                <img
                                                  src={
                                                    item.image ||
                                                    item.image_url ||
                                                    ""
                                                  }
                                                  alt={item.name}
                                                  style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                  }}
                                                />
                                              ) : (
                                                <Box
                                                  sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "grey.400",
                                                  }}
                                                >
                                                  <Typography variant="caption">
                                                    No Image
                                                  </Typography>
                                                </Box>
                                              )}
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                              <Typography
                                                variant="body2"
                                                fontWeight={500}
                                              >
                                                {item.name}
                                              </Typography>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                display="block"
                                              >
                                                ID: {item.id}
                                              </Typography>
                                              <Typography
                                                variant="caption"
                                                color="text.secondary"
                                              >
                                                {item.quantity} ×{" "}
                                                {formatCurrency(item.price)}
                                              </Typography>
                                            </Box>
                                            <Typography
                                              variant="body2"
                                              fontWeight={500}
                                            >
                                              {formatCurrency(
                                                item.price * item.quantity
                                              )}
                                            </Typography>
                                          </Box>
                                        ))}

                                        {/* Order Summary */}
                                        <Box
                                          sx={{
                                            borderTop: 1,
                                            borderColor: "divider",
                                            pt: 2,
                                            mt: 2,
                                          }}
                                        >
                                          {order.coupon_code && (
                                            <Box
                                              sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                mb: 1,
                                              }}
                                            >
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                              >
                                                Discount ({order.coupon_code})
                                              </Typography>
                                              <Typography
                                                variant="body2"
                                                color="success.main"
                                              >
                                                -
                                                {formatCurrency(
                                                  order.discount_amount || 0
                                                )}
                                              </Typography>
                                            </Box>
                                          )}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "space-between",
                                              mb: 1,
                                            }}
                                          >
                                            <Typography
                                              variant="body2"
                                              fontWeight={600}
                                            >
                                              Total
                                            </Typography>
                                            <Typography
                                              variant="body2"
                                              fontWeight={600}
                                            >
                                              {formatCurrency(
                                                order.total_amount
                                              )}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </Stack>
                                    </Paper>
                                  </>
                                )}
                              </Box>
                            </Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 2, display: "block" }}
                            >
                              Last Updated: {formatDate(order.updated_at)}
                            </Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default AllOrdersManager;
