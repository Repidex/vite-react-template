import React, { createContext, useContext, useState, useEffect } from "react";

/* -------- TYPES -------- */
export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number; // ✅ add this
};

type CartContextType = {
  items: CartItem[];
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "jewellery_cart";

/* -------- SAFE LOCAL STORAGE READ -------- */
const getInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

/* -------- PROVIDER -------- */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(getInitialCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  /* -------- CART VISIBILITY -------- */
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  /* -------- STORAGE SYNC -------- */
  const saveToLocalStorage = (cartItems: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }
  };

  /* -------- ADD -------- */
  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const updated = existing
        ? prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...prev, { ...item, quantity: 1 }];

      saveToLocalStorage(updated);
      return updated;
    });

    openCart(); // ✅ only add opens cart
  };

  /* -------- REMOVE -------- */
  const removeFromCart = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });
  };

  /* -------- UPDATE QUANTITY -------- */
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }

    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      saveToLocalStorage(updated);
      return updated;
    });
  };

  const incrementQuantity = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) updateQuantity(id, item.quantity + 1);
  };

  const decrementQuantity = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.quantity === 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, item.quantity - 1);
    }
  };

  /* -------- CLEAR -------- */
  const clearCart = () => {
    setItems([]);
    saveToLocalStorage([]);
  };

  /* -------- TOTALS -------- */
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  /* -------- CROSS-TAB SYNC -------- */
  useEffect(() => {
    const handleStorageChange = () => {
      setItems(getInitialCart());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems: items,
        addToCart,
        removeFromCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        totalPrice,
        totalItems,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* -------- HOOK -------- */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
