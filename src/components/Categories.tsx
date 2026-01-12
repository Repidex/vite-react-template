import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ================= TYPES ================= */
interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  price: number;
  image_url: string[];
  categories?: Category | null;
}

/* ================= COMPONENT ================= */
const CategoryShowcaseSection: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTabBackground, setActiveTabBackground] = useState({
    width: 0,
    left: 0,
    opacity: 0,
  });

  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchCategories();
    checkMobile();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (activeCategory) {
      updateActiveTabBackground();
    }
  }, [activeCategory, categories, isMobile]);

  useEffect(() => {
    const checkScrollable = () => {
      const container = itemsContainerRef.current;
      if (container) {
        setShowScrollButtons(container.scrollWidth > container.clientWidth);
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [items, isMobile]);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const handleResize = () => {
    checkMobile();
    updateActiveTabBackground();
  };

  const updateActiveTabBackground = () => {
    if (!activeTabRef.current || isMobile) {
      setActiveTabBackground({ width: 0, left: 0, opacity: 0 });
      return;
    }

    const tabElement = activeTabRef.current;
    const container = tabsContainerRef.current;

    if (tabElement && container) {
      const tabRect = tabElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setActiveTabBackground({
        width: tabRect.width,
        left: tabRect.left - containerRect.left,
        opacity: 1,
      });
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name");

    if (!error && data?.length) {
      setCategories(data);
      setActiveCategory(data[0].id); // default first tab
    }
  };
  useEffect(() => {
    if (activeCategory) {
      fetchItemsByCategory(activeCategory);
    }
  }, [activeCategory]);

  const fetchItemsByCategory = async (categoryId: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("items")
        .select(
          `
        id,
        name,
        price,
        image_url,
        category_id,
        categories ( id, name )
      `
        )
        .eq("category_id", categoryId) // ✅ IMPORTANT
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedItems: Item[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price ?? 0,
        image_url: Array.isArray(item.image_url)
          ? item.image_url.filter(
              (img): img is string => typeof img === "string"
            )
          : item.image_url
          ? [String(item.image_url)]
          : [],
        category_id: item.category_id ?? "",
        category_name: item.categories?.name,
        default_discount_percentage: 0,
        stock: 0,
        is_featured: false,
        size: undefined,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching items by category:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollItems = useCallback(
    (direction: "left" | "right") => {
      if (!itemsContainerRef.current) return;
      const container = itemsContainerRef.current;
      const cardWidth = isMobile ? 180 : 240;
      const visibleCards = Math.floor(container.clientWidth / cardWidth);
      const scrollAmount = cardWidth * Math.max(1, visibleCards - 1);

      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    },
    [isMobile]
  );

  const scrollTab = (direction: "left" | "right") => {
    if (!tabsContainerRef.current) return;
    const container = tabsContainerRef.current;
    const scrollAmount = 100;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleTabClick = (categoryId: string) => {
    if (categoryId !== activeCategory) {
      setActiveCategory(categoryId);
    }
  };

  return (
    <section style={styles.wrapper}>
      <div style={styles.backgroundPattern}></div>

      <div style={styles.container}>
        {/* Heading */}
        <div style={styles.headingWrapper}>
          <h2 style={styles.heading}>
            SHOP A SPECIAL
            <br />
            SOMETHING FOR YOURSELF
          </h2>
          <div style={styles.headingUnderline}></div>
        </div>

        {/* Category Tabs */}
        <div style={styles.tabsOuter}>
          {!isMobile && categories.length > 0 && (
            <button
              onClick={() => scrollTab("left")}
              style={styles.tabScrollButtonLeft}
              aria-label="Scroll tabs left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div
            style={{
              ...styles.tabsWrapper,
              ...(isMobile ? styles.tabsWrapperMobile : {}),
            }}
          >
            {/* Active tab background indicator for desktop */}
            {!isMobile && activeTabBackground.width > 0 && (
              <div
                style={{
                  ...styles.activeTabBackground,
                  width: `${activeTabBackground.width}px`,
                  left: `${activeTabBackground.left}px`,
                  opacity: activeTabBackground.opacity,
                }}
              />
            )}

            <div
              style={{
                ...styles.tabsContainer,
                ...(isMobile ? styles.tabsContainerMobile : {}),
              }}
              ref={tabsContainerRef}
              className="draggable-scroll"
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  ref={activeCategory === cat.id ? activeTabRef : null}
                  onClick={() => handleTabClick(cat.id)}
                  style={{
                    ...styles.tab,
                    ...(isMobile ? styles.tabMobile : {}),
                    ...(activeCategory === cat.id ? styles.activeTab : {}),
                    ...(isMobile && activeCategory === cat.id
                      ? styles.activeTabMobile
                      : {}),
                  }}
                  aria-label={`Show ${cat.name} items`}
                  aria-pressed={activeCategory === cat.id}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {!isMobile && categories.length > 0 && (
            <button
              onClick={() => scrollTab("right")}
              style={styles.tabScrollButtonRight}
              aria-label="Scroll tabs right"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Items Slider */}
        <div style={styles.itemsWrapper}>
          {showScrollButtons && !isMobile && (
            <button
              onClick={() => scrollItems("left")}
              style={styles.scrollButtonLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} style={styles.scrollIcon} />
            </button>
          )}

          <div
            style={{
              ...styles.itemsContainer,
              ...(isMobile ? styles.itemsContainerMobile : {}),
            }}
            ref={itemsContainerRef}
            className="draggable-scroll"
          >
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading...</p>
              </div>
            ) : items.length === 0 ? (
              <div style={styles.noItemsContainer}>
                <p style={styles.noItemsText}>
                  No items found in this category
                </p>
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  state={{ item }}
                  style={{ textDecoration: "none", color: "inherit" }}
                  aria-label={`View ${item.name} - ₹${item.price}`}
                >
                  <div
                    style={{
                      ...styles.card,
                      ...(isMobile ? styles.cardMobile : {}),
                      cursor: "pointer",
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        ...styles.imageContainer,
                        ...(isMobile ? styles.imageContainerMobile : {}),
                      }}
                    >
                      <div style={styles.imageWrapper}>
                        <img
                          src={item.image_url?.[0]}
                          alt={item.name}
                          style={styles.image}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop";
                          }}
                        />
                      </div>

                      {!isMobile && (
                        <div style={styles.categoryTag}>
                          {item.categories?.name || "Product"}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        ...styles.cardContent,
                        ...(isMobile ? styles.cardContentMobile : {}),
                      }}
                    >
                      <h3
                        style={{
                          ...styles.productName,
                          ...(isMobile ? styles.productNameMobile : {}),
                        }}
                      >
                        {item.name}
                      </h3>

                      <div style={styles.priceRow}>
                        <p style={styles.productPrice}>
                          ₹{item.price.toLocaleString()}
                        </p>
                      </div>

                      {!isMobile && (
                        <div style={styles.viewButton}>View Product →</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {showScrollButtons && !isMobile && (
            <button
              onClick={() => scrollItems("right")}
              style={styles.scrollButtonRight}
              aria-label="Scroll right"
            >
              <ChevronRight size={20} style={styles.scrollIcon} />
            </button>
          )}
        </div>

        {/* View all button */}
        <div style={styles.viewAllWrapper}>
          <button
            style={{
              ...styles.viewAllButton,
              ...(isMobile ? styles.viewAllButtonMobile : {}),
            }}
            onClick={() => navigate("/all-jewellery")}
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcaseSection;

/* ================= STYLES ================= */
const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    width: "100%",
    padding: "clamp(40px, 6vw, 100px) 0",
    backgroundColor: "#faf9f7",
    position: "relative",
    overflow: "hidden",
    minHeight: "auto",
    display: "flex",
    alignItems: "center",
  },

  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "radial-gradient(circle at 20% 80%, rgba(75, 54, 33, 0.03) 0%, transparent 50%)",
    pointerEvents: "none",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "10px 12px",
    width: "100%",
    position: "relative",
    zIndex: 1,
    boxSizing: "border-box",
  },

  headingWrapper: {
    textAlign: "center",
    marginBottom: "clamp(24px, 4vw, 48px)",
  },

  heading: {
    fontSize: "clamp(25px, 4vw, 42px)",
    fontWeight: 400,
    letterSpacing: "2px",
    color: "rgb(99 80 31)",
    marginBottom: "24px",
    lineHeight: 1.3,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  headingLine: {
    display: "block",
    color: "rgb(133 112 60)",
  },

  headingUnderline: {
    width: "60px",
    height: "2px",
    backgroundColor: "#4b3621",
    margin: "0 auto",
    opacity: 0.6,
  },

  // Tabs Section
  tabsOuter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "clamp(24px, 4vw, 48px)",
    position: "relative",
    gap: "8px",
  },

  tabsWrapper: {
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: "50px",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(0, 0, 0, 0.03)",
    padding: "4px",
  },

  tabsWrapperMobile: {
    borderRadius: "8px",
    padding: "2px",
    width: "100%",
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
    border: "1px solid rgba(0, 0, 0, 0.03)",
  },

  tabsContainer: {
    display: "flex",
    gap: "2px",
    position: "relative",
    zIndex: 2,
    overflowX: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  tabsContainerMobile: {
    justifyContent: "flex-start",
    maxWidth: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    backgroundColor: "transparent",
    borderRadius: "6px",
  },

  // Active tab background for desktop
  activeTabBackground: {
    position: "absolute",
    top: "4px",
    height: "calc(100% - 8px)",
    backgroundColor: "#f5f3f0",
    borderRadius: "40px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 1,
    pointerEvents: "none",
  },

  tab: {
    background: "none",
    border: "none",
    fontSize: "14px",
    color: "#666",
    cursor: "pointer",
    padding: "10px 20px",
    whiteSpace: "nowrap",
    fontWeight: 400,
    borderRadius: "40px",
    transition: "color 0.3s ease",
    position: "relative",
    zIndex: 2,
    flexShrink: 0,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  tabMobile: {
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    minWidth: "auto",
    backgroundColor: "transparent",
    color: "#666",
    transition: "all 0.2s ease",
  },

  activeTab: {
    color: "#1a1a1a",
    fontWeight: 500,
  },

  activeTabMobile: {
    backgroundColor: "#4b3621",
    color: "#ffffff",
    fontWeight: 500,
  },

  tabScrollButtonLeft: {
    background: "none",
    border: "1px solid #e0e0e0",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.2s ease",
  },

  tabScrollButtonRight: {
    background: "none",
    border: "1px solid #e0e0e0",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.2s ease",
  },

  // Items Section
  itemsWrapper: {
    position: "relative",
    width: "100%",
    padding: "0",
  },

  itemsContainer: {
    display: "grid",
    gridAutoFlow: "column",
    gridAutoColumns: "minmax(240px, 1fr)",
    gap: "24px",
    overflowX: "auto",
    scrollBehavior: "smooth",
    padding: "10px 0 20px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },

  itemsContainerMobile: {
    gridAutoColumns: "calc(50% - 6px)",
    gap: "12px",
    padding: "0 4px 10px 0",
    gridAutoFlow: "column",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    border: "1px solid rgba(0, 0, 0, 0.02)",
    position: "relative",
    minWidth: "240px",
  },

  cardMobile: {
    minWidth: "auto",
    width: "100%",
    borderRadius: "8px",
    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.03)",
    scrollSnapAlign: "start",
  },

  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 1",
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
  },

  imageContainerMobile: {
    aspectRatio: "1 / 1",
  },

  imageWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  categoryTag: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "4px 10px",
    borderRadius: "16px",
    fontSize: "11px",
    fontWeight: 500,
    color: "#4b3621",
    backdropFilter: "blur(4px)",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  cardContent: {
    padding: "16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  cardContentMobile: {
    padding: "12px",
    gap: "6px",
  },

  productName: {
    fontSize: "15px",
    fontWeight: 400,
    color: "#1a1a1a",
    lineHeight: 1.3,
    flex: 1,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    margin: 0,
    minHeight: "38px",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  productNameMobile: {
    fontSize: "13px",
    minHeight: "34px",
    fontWeight: 400,
    lineHeight: 1.3,
  },

  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "2px",
  },

  productPrice: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a1a1a",
    margin: 0,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  viewButton: {
    fontSize: "13px",
    color: "#4b3621",
    fontWeight: 500,
    marginTop: "4px",
    opacity: 0,
    transform: "translateY(10px)",
    transition: "all 0.3s ease",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  // Scroll Buttons for Desktop
  scrollButtonLeft: {
    position: "absolute",
    left: "-20px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "#ffffff",
    border: "none",
    borderRadius: "50%",
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
    transition: "all 0.3s ease",
    opacity: 0.9,
  },

  scrollButtonRight: {
    position: "absolute",
    right: "-20px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "#ffffff",
    border: "none",
    borderRadius: "50%",
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
    transition: "all 0.3s ease",
    opacity: 0.9,
  },

  scrollIcon: {
    color: "#1a1a1a",
    strokeWidth: 1.5,
  },

  // Loading States
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    gridColumn: "1 / -1",
  },

  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(75, 54, 33, 0.1)",
    borderTop: "3px solid #4b3621",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },

  loadingText: {
    fontSize: "14px",
    color: "#666",
    fontWeight: 400,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  noItemsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
    gridColumn: "1 / -1",
  },

  noItemsText: {
    fontSize: "14px",
    color: "#666",
    fontWeight: 400,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  viewAllWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "clamp(24px, 4vw, 40px)",
    paddingBottom: "20px",
  },

  viewAllButton: {
    backgroundColor: "transparent",
    border: "1px solid #4b3621",
    color: "#4b3621",
    padding: "12px 32px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "50px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    letterSpacing: "0.5px",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  viewAllButtonMobile: {
    padding: "10px 28px",
    fontSize: "13px",
    width: "100%",
    maxWidth: "280px",
  },
};

/* ================= STYLESHEET ================= */
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .draggable-scroll {
    cursor: grab;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .draggable-scroll::-webkit-scrollbar {
    display: none;
  }

  .draggable-scroll:active {
    cursor: grabbing;
  }

  /* Desktop hover effects */
  @media (min-width: 768px) {
    .card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
    }

    .card:hover .image {
      transform: scale(1.08);
    }

    .card:hover .viewButton {
      opacity: 1;
      transform: translateY(0);
    }

    .scrollButtonLeft:hover,
    .scrollButtonRight:hover {
      transform: translateY(-50%) scale(1.1);
      opacity: 1;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    }

    .tab:hover {
      color: #333;
    }

    .tabScrollButtonLeft:hover,
    .tabScrollButtonRight:hover {
      background-color: #f5f5f5;
      transform: scale(1.05);
    }

    .viewAllButton:hover {
      background-color: #4b3621;
      color: #ffffff;
    }
  }

  /* Mobile optimizations */
  @media (max-width: 767px) {
    .tabsContainerMobile::-webkit-scrollbar {
      display: none;
    }
    
    .cardMobile {
      margin-bottom: 0;
    }
    
    .itemsContainerMobile::-webkit-scrollbar {
      height: 3px;
    }
    
    .itemsContainerMobile::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }

    .viewAllButtonMobile {
      font-size: 14px;
      padding: 12px 32px;
    }

    /* Mobile active tab - NOW WORKING */
    .tabsContainerMobile button[aria-pressed="true"] {
      background-color: #4b3621 !important;
      color: #ffffff !important;
      font-weight: 500 !important;
    }
  }

  /* Mobile touch optimizations */
  @media (hover: none) and (pointer: coarse) {
    .draggable-scroll {
      -webkit-overflow-scrolling: touch;
    }
    
    .card {
      user-select: none;
    }
  }
`;
document.head.appendChild(styleSheet);
