import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../providers/CartContext";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { supabase } from "../supabase/client";
import { CircularProgress, Box } from "@mui/material";

/* ---------------- TYPES ---------------- */
type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url?: string[];
  category_id?: string;
};
type WishlistItem = {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  image_url?: string[];
};
/* ---------------- COMPONENT ---------------- */
const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();

  const [item, setItem] = useState<Item | undefined>(undefined);
  const [open, setOpen] = useState<string | null>("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [similarItems, setSimilarItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingItem, setFetchingItem] = useState(true);
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);

  // Fetch item by ID whenever ID changes
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        navigate("/shop");
        return;
      }

      setFetchingItem(true);
      try {
        const { data, error } = await supabase
          .from("items")
          .select("id, name, description, price, image_url, category_id")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching item:", error);
          navigate("/shop");
          return;
        }

        if (data) {
          const typedData = data as Item;
          setItem(typedData);
          // Set the first image as active when item is fetched
          if (typedData.image_url && typedData.image_url[0]) {
            setActiveImage(typedData.image_url[0]);
          }
        } else {
          navigate("/shop");
        }
      } catch (err) {
        console.error("Error:", err);
        navigate("/shop");
      } finally {
        setFetchingItem(false);
      }
    };

    fetchItem();
    // Scroll to top when navigating to a new product
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, navigate]);

  // Fetch similar items from same category
  useEffect(() => {
    const fetchSimilarItems = async () => {
      if (!item?.category_id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("items")
          .select("id, name, price, image_url, category_id, description")
          .eq("category_id", item.category_id)
          .neq("id", item.id)
          .limit(8);

        if (!error && data) {
          setSimilarItems(data as Item[]);
        }
      } catch (err) {
        console.error("Error fetching similar items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarItems();
  }, [item?.id, item?.category_id]);

  // Check wishlist status
  useEffect(() => {
    if (item?.id) {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setIsWishlisted(wishlist.some((i: any) => i.id === item.id));
    }
  }, [item?.id]);

  const images = (item?.image_url || []).slice(0, 5);

  const toggle = (key: string) => setOpen(open === key ? null : key);

  const handleAddToCart = () => {
    if (!item) return;
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image_url?.[0],
    });
    openCart();
  };

  const handleWishlistToggle = () => {
    if (!item) return;
    const wishlist: WishlistItem[] = JSON.parse(
      localStorage.getItem("wishlist") || "[]"
    );

    const exists = wishlist.some((i) => i.id === item.id);

    let updatedWishlist: WishlistItem[];

    if (exists) {
      updatedWishlist = wishlist.filter((i) => i.id !== item.id);
      setIsWishlisted(false);
    } else {
      const wishlistItem: WishlistItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description ?? null,
        image_url: item.image_url ?? [],
      };

      updatedWishlist = [...wishlist, wishlistItem];
      setIsWishlisted(true);
    }

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const handleSimilarItemClick = (product: Item) => {
    navigate(`/product/${product.id}`);
  };

  // Show loading state
  if (fetchingItem) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If no item found
  if (!item) return null;

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        {/* IMAGE SECTION */}
        <div style={styles.imageSection}>
          <div style={styles.imageWrapper}>
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={4}
              wheel={{ step: 0.2 }}
              doubleClick={{ step: 1.5 }}
              pinch={{ step: 5 }}
              centerOnInit
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={activeImage}
                  alt={item.name}
                  style={styles.mainImage}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>

          {images.length > 1 && (
            <div style={styles.thumbRow}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImage(img)}
                  style={{
                    ...styles.thumb,
                    border:
                      img === activeImage
                        ? "1.5px solid #c6a67d"
                        : "1px solid #ddd",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* DETAILS PANEL */}
        <div style={styles.details}>
          <span style={styles.back} onClick={() => navigate(-1)}>
            ← Back to shop
          </span>

          <h1 style={styles.title}>{item.name}</h1>
          <p style={styles.price}>₹{item.price.toLocaleString()}</p>

          {/* CTA */}
          <div style={styles.cta}>
            <button style={styles.addBtn} onClick={handleAddToCart}>
              ADD TO BAG
            </button>
            <button
              style={{
                ...styles.wishBtn,
                color: isWishlisted ? "#e53935" : "#444",
              }}
              onClick={handleWishlistToggle}
              aria-label="Add to wishlist"
            >
              {isWishlisted ? "♥" : "♡"}
            </button>
          </div>

          {/* ACCORDION */}
          <div style={styles.accordion}>
            <Acc
              title="Description"
              open={open === "description"}
              onClick={() => toggle("description")}
            >
              {item.description}
            </Acc>

            <Acc
              title="Details & Composition"
              open={open === "details"}
              onClick={() => toggle("details")}
            >
              <ul style={styles.list}>
                <li>Gold plated alloy</li>
                <li>American diamonds</li>
                <li>Approx weight: 12g</li>
              </ul>
            </Acc>

            <Acc
              title="Shipping & Returns"
              open={open === "shipping"}
              onClick={() => toggle("shipping")}
            >
              Free delivery in 5–7 days. Easy 7-day return policy.
            </Acc>
          </div>
        </div>
      </div>

      {/* SIMILAR ITEMS SECTION */}
      {loading ? (
        <div style={styles.similarSection}>
          <div style={styles.similarContainer}>
            <p style={{ textAlign: "center", color: "#9c7c56" }}>
              Loading similar items...
            </p>
          </div>
        </div>
      ) : similarItems.length > 0 ? (
        <div style={styles.similarSection}>
          <div style={styles.similarContainer}>
            <h2 style={styles.similarTitle}>You Might Also Like</h2>
            <div style={styles.similarGrid}>
              {similarItems.map((product) => (
                <div
                  key={product.id}
                  style={styles.similarCard}
                  onClick={() => handleSimilarItemClick(product)}
                >
                  <div style={styles.similarImageWrapper}>
                    <img
                      src={product.image_url?.[0] || ""}
                      alt={product.name}
                      style={styles.similarImage}
                    />
                  </div>
                  <div style={{ padding: "12px" }}>
                    <h3 style={styles.similarItemName}>{product.name}</h3>
                    <p style={styles.similarItemPrice}>
                      ₹{product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetails;

/* ---------------- ACCORDION ---------------- */
const Acc = ({
  title,
  open,
  onClick,
  children,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <div style={styles.accItem}>
    <div style={styles.accHeader} onClick={onClick}>
      <span>{title}</span>
      <span>{open ? "−" : "+"}</span>
    </div>
    {open && <div style={styles.accBody}>{children}</div>}
  </div>
);

/* ---------------- STYLES ---------------- */
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#f7f2ec",
  },
  layout: {
    display: "flex",
    flexDirection: "column",
  },
  imageSection: {
    background: "#fff",
    padding: "15px",
  },
  imageWrapper: {
    aspectRatio: "1 / 1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mainImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    cursor: "zoom-in",
  },
  thumbRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "18px",
  },
  thumb: {
    width: "64px",
    height: "64px",
    objectFit: "cover",
    cursor: "pointer",
  },
  details: {
    background: "#f7f2ec",
    padding: "40px",
  },
  back: {
    fontSize: "13px",
    color: "#9c7c56",
    marginBottom: "18px",
    display: "inline-block",
    cursor: "pointer",
  },
  title: {
    fontSize: "32px",
    fontWeight: 500,
    color: "#3b2a1a",
    marginBottom: "6px",
  },
  price: {
    fontSize: "18px",
    marginBottom: "28px",
  },
  cta: {
    display: "flex",
    gap: "12px",
    margin: "32px 0",
  },
  addBtn: {
    flex: 1,
    padding: "14px",
    background: "#d6b98c",
    border: "none",
    fontWeight: 500,
    cursor: "pointer",
  },
  wishBtn: {
    width: "48px",
    border: "1px solid #d6b98c",
    background: "transparent",
    cursor: "pointer",
  },
  accordion: {
    borderTop: "1px solid #ddd",
  },
  accItem: {
    borderBottom: "1px solid #ddd",
  },
  accHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 0",
    cursor: "pointer",
    fontSize: "14px",
  },
  accBody: {
    fontSize: "14px",
    paddingBottom: "16px",
    lineHeight: 1.6,
  },
  list: {
    paddingLeft: "18px",
    lineHeight: 1.7,
  },
  similarSection: {
    background: "#fff",
    padding: "20px 5px",
    borderTop: "1px solid #f0f0f0",
  },
  similarContainer: {
    maxWidth: "1440px",
    margin: "0 auto",
  },
  similarTitle: {
    fontSize: "24px",
    fontWeight: 500,
    color: "#3b2a1a",
    marginBottom: "24px",
    textAlign: "center",
  },
  similarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  similarCard: {
    cursor: "pointer",
    transition: "transform 0.2s ease",
    border: "1px solid #f0f0f0",
    borderRadius: "4px",
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  similarImageWrapper: {
    aspectRatio: "1 / 1",
    background: "#f5f5f5",
    overflow: "hidden",
  },
  similarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  similarItemName: {
    fontSize: "13px",
    fontWeight: 400,
    color: "#000",
    marginBottom: "8px",
    lineHeight: 1.2,
    margin: "0 0 8px 0",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  similarItemPrice: {
    fontSize: "14px",
    color: "#000",
    fontWeight: 500,
    margin: 0,
  },
};

/* DESKTOP LAYOUT */
if (window.innerWidth >= 1024) {
  styles.layout.flexDirection = "row";
  styles.imageSection.flex = 1;
  styles.details.flex = 1;
  styles.similarGrid.gridTemplateColumns = "repeat(4, 1fr)";
}

/* TABLET LAYOUT */
if (window.innerWidth >= 768 && window.innerWidth < 1024) {
  styles.similarGrid.gridTemplateColumns = "repeat(3, 1fr)";
}
