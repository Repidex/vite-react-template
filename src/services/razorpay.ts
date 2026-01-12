import { supabase } from "../integrations/supabase/client";
import { RAZORPAY_CONFIG } from "../config/razorpay";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
};

// Generate a unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${timestamp}-${random}`;
};

export const createOrder = async (
  amount: number,
  shippingAddress: ShippingAddress,
  cartItems: any[]
) => {
  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("User not authenticated");

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        total_amount: amount,
        status: "pending",
        user_id: user.id,
        order_number: generateOrderNumber(),
        items: JSON.parse(JSON.stringify(cartItems)),
        payment_method: "razorpay",
        payment_status: "pending",
        shipping: 0,
        subtotal: amount,
        tax: 0,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create shipping information
    // Note: order_shipping table exists but not in generated types yet
    const { error: shippingError } = await (supabase as any)
      .from("order_shipping")
      .insert({
        order_id: order.id,
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip_code: shippingAddress.zipCode,
        country: shippingAddress.country,
      });

    if (shippingError) throw shippingError;

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      item_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const initializePayment = async (
  order: any,
  user: any,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
) => {
  try {
    await loadRazorpayScript();

    const options = {
      ...RAZORPAY_CONFIG,
      amount: order.total_amount * 100, // Razorpay expects amount in paise
      order_id: order.id,
      prefill: {
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        contact: user.user_metadata?.phone || "",
      },
      handler: async (response: any) => {
        try {
          // Create payment record
          const { error: paymentError } = await supabase
            .from("payments")
            .insert({
              order_id: order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.total_amount,
              payment_method: "razorpay",
              status: "completed",
            });

          if (paymentError) throw paymentError;

          // Update order status
          const { error: orderError } = await supabase
            .from("orders")
            .update({ status: "paid" })
            .eq("id", order.id);

          if (orderError) throw orderError;

          onSuccess(response);
        } catch (error) {
          onError(error);
        }
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    onError(error);
  }
};
