import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import {
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  Plus,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../providers/CartContext";

/* ================= TYPES ================= */

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: any;
  original_price?: number | null;
  categories?: Category | null;
  default_discount_percentage?: number | null;
}

interface PriceRange {
  min: number;
  max: number;
}

const ITEMS_PER_PAGE = 12;
const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹2K", min: 500, max: 2000 },
  { label: "₹2K - ₹5K", min: 2000, max: 5000 },
  { label: "₹5K - ₹10K", min: 5000, max: 10000 },
  { label: "Above ₹10K", min: 10000, max: 1000000 },
];

const AllJewelleryPage = () => {
  const { addToCart } = useCart();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFromUrl ? [categoryFromUrl] : []
  );
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<PriceRange | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "newest" | "price_low_high" | "price_high_low"
  >("newest");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl]);
      setPage(1);
    } else if (categoryFromUrl === null) {
      // URL has no category parameter, but don't clear if user is filtering manually
      // This preserves user's manual filter selection
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    fetchItems();
  }, [selectedCategories, page, sortBy, selectedPriceRange]);
  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [selectedCategories, selectedPriceRange, sortBy, page]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (!error) setCategories(data || []);
  };

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase.from("items").select(
      `
      id,
      name,
      description,
      price,
      image_url,
      category_id,
      default_discount_percentage,
      categories ( id, name )
    `,
      { count: "exact" }
    );

    // ✅ CATEGORY FILTER - Now supports multiple categories
    if (selectedCategories.length > 0) {
      query = query.in("category_id", selectedCategories);
    }

    // ✅ PRICE RANGE
    if (selectedPriceRange) {
      query = query
        .gte("price", selectedPriceRange.min)
        .lte("price", selectedPriceRange.max);
    }

    // ✅ CUSTOM PRICE
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : 1_000_000;
      query = query.gte("price", min).lte("price", max);
    }

    // ✅ SORTING
    if (sortBy === "price_low_high") {
      query = query.order("price", { ascending: true });
    } else if (sortBy === "price_high_low") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // ✅ PAGINATION — ALWAYS LAST
    query = query.range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

    const { data, error, count } = await query;

    if (!error) {
      setItems(data || []);
      setTotalItems(count || 0);
    }
    setLoading(false);
  };

  const handlePriceRangeSelect = (range: PriceRange) => {
    setSelectedPriceRange(range);
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setPage(1);
  };

  const handleCustomPriceSubmit = () => {
    setSelectedPriceRange(null);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setPage(1);
  };

  const calculateDiscount = (discountPercentage?: number) => {
    return discountPercentage || 0;
  };

  const calculateDiscountedPrice = (
    price: number,
    discountPercentage?: number
  ) => {
    if (!discountPercentage || discountPercentage === 0) return null;
    return price - (price * discountPercentage) / 100;
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const activeFiltersCount = [
    selectedCategories.length > 0 ? "categories" : null,
    selectedPriceRange,
    minPrice || maxPrice,
  ].filter(Boolean).length;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div className="page-header" style={styles.header}>
        <div className="header-left" style={styles.headerLeft}>
          <h1 className="page-title" style={styles.title}>
            Jewellery Collection
          </h1>
          <p className="page-subtitle" style={styles.subtitle}>
            Discover {totalItems} exquisite pieces
          </p>
        </div>

        <div className="header-controls" style={styles.headerControls}>
          {/* Sort Dropdown */}
          <div style={styles.sortContainer}>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="sort-select"
              style={styles.sortSelect}
            >
              <option value="newest">Newest First</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
            </select>
          </div>

          {/* Filter Button for Mobile */}
          <button
            onClick={() => setShowFilters(true)}
            className="filter-button"
            style={styles.filterButtonMobile}
          >
            <SlidersHorizontal size={18} />
            {activeFiltersCount > 0 && (
              <span style={styles.filterBadge}>{activeFiltersCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.contentWrapper}>
        {/* Filters Sidebar (Desktop) */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitleContainer}>
              <Filter size={18} style={styles.filterIcon} />
              <h3 style={styles.sidebarTitle}>Filters</h3>
            </div>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} style={styles.clearButton}>
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div style={styles.filterSection}>
            <h4 style={styles.filterTitle}>Category</h4>
            <div style={styles.filterList}>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setPage(1);
                }}
                style={{
                  ...styles.categoryButton,
                  ...(selectedCategories.length === 0
                    ? styles.activeFilter
                    : {}),
                }}
              >
                All Jewellery
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    toggleCategory(cat.id);
                  }}
                  style={{
                    ...styles.categoryButton,
                    ...(selectedCategories.includes(cat.id)
                      ? styles.activeFilter
                      : {}),
                  }}
                >
                  {selectedCategories.includes(cat.id) && (
                    <span style={{ marginRight: "6px" }}>✓</span>
                  )}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={styles.filterSection}>
            <h4 style={styles.filterTitle}>Price Range</h4>
            <div style={styles.priceRangeList}>
              {PRICE_RANGES.map((range, index) => (
                <button
                  key={index}
                  onClick={() => handlePriceRangeSelect(range)}
                  style={{
                    ...styles.priceRangeButton,
                    ...(selectedPriceRange?.min === range.min
                      ? styles.activeFilter
                      : {}),
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom Price Input */}
            <div style={styles.customPrice}>
              <div style={styles.priceInputs}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={styles.priceInput}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleCustomPriceSubmit()
                  }
                />
                <span style={styles.priceSeparator}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={styles.priceInput}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleCustomPriceSubmit()
                  }
                />
                <button
                  onClick={handleCustomPriceSubmit}
                  style={styles.applyButton}
                  disabled={!minPrice && !maxPrice}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategories.length > 0 ||
            selectedPriceRange ||
            minPrice ||
            maxPrice) && (
            <div style={styles.activeFiltersSidebar}>
              <div style={styles.activeFiltersHeader}>
                <span style={styles.activeFiltersTitle}>Active Filters</span>
                <button onClick={clearAllFilters} style={styles.clearAllButton}>
                  Clear All
                </button>
              </div>
              <div style={styles.activeFiltersList}>
                {selectedCategories.map((catId) => (
                  <span key={catId} style={styles.activeFilterChip}>
                    {categories.find((c) => c.id === catId)?.name}
                    <button
                      onClick={() => toggleCategory(catId)}
                      style={styles.removeFilterButton}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {selectedPriceRange && (
                  <span style={styles.activeFilterChip}>
                    {
                      PRICE_RANGES.find((r) => r.min === selectedPriceRange.min)
                        ?.label
                    }
                    <button
                      onClick={() => setSelectedPriceRange(null)}
                      style={styles.removeFilterButton}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && !selectedPriceRange && (
                  <span style={styles.activeFilterChip}>
                    ₹{minPrice || "0"}-₹{maxPrice || "∞"}
                    <button
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      style={styles.removeFilterButton}
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Products Grid */}
        <main style={styles.mainContent}>
          {/* Products Grid */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <p style={styles.loadingText}>Loading jewellery...</p>
            </div>
          ) : items.length === 0 ? (
            <div style={styles.noResults}>
              <Sparkles size={48} color="#D4AF37" />
              <p style={styles.noResultsText}>
                No jewellery found matching your criteria
              </p>
              <button
                onClick={clearAllFilters}
                style={styles.clearFiltersButton}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid">
                {items.map((item) => {
                  const discount = calculateDiscount(
                    item.default_discount_percentage ?? undefined
                  );
                  const discountedPrice = calculateDiscountedPrice(
                    item.price,
                    item.default_discount_percentage ?? undefined
                  );
                  return (
                    <Link
                      key={item.id}
                      to={`/product/${item.id}`}
                      state={{ item }}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        className="product-card"
                        style={{ ...styles.card, cursor: "pointer" }}
                      >
                        <div style={styles.imageContainer}>
                          <img
                            src={item.image_url?.[0]}
                            alt={item.name}
                            style={styles.image}
                            loading="lazy"
                          />
                          {discount > 0 && (
                            <span style={styles.discountBadge}>
                              -{discount}%
                            </span>
                          )}
                          <div style={styles.categoryTag}>
                            {item.categories?.name}
                          </div>
                        </div>

                        <div style={styles.cardContent}>
                          <h3
                            className="product-name"
                            style={styles.productName}
                          >
                            {item.name}
                          </h3>

                          <div style={styles.priceContainer}>
                            <div style={styles.priceRow}>
                              {discountedPrice ? (
                                <>
                                  <span
                                    className="product-current-price"
                                    style={styles.currentPrice}
                                  >
                                    ₹
                                    {Math.round(
                                      discountedPrice
                                    ).toLocaleString()}
                                  </span>
                                  <span
                                    className="product-original-price"
                                    style={styles.originalPrice}
                                  >
                                    ₹{item.price.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span
                                  className="product-current-price"
                                  style={styles.currentPrice}
                                >
                                  ₹{item.price.toLocaleString()}
                                </span>
                              )}
                              {discount > 0 && (
                                <span style={styles.discountTag}>
                                  -{discount}%
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart({
                                  id: item.id,
                                  name: item.name,
                                  price: discountedPrice ? Math.round(discountedPrice) : item.price,
                                  image: item.image_url?.[0],
                                });
                              }}
                              aria-label={`Add ${item.name} to cart`}
                              style={styles.plusButton}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    style={styles.pageBtn}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div style={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          style={{
                            ...styles.pageNumberBtn,
                            ...(page === pageNum ? styles.activePage : {}),
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && page < totalPages - 2 && (
                      <>
                        <span style={styles.pageDots}>···</span>
                        <button
                          onClick={() => setPage(totalPages)}
                          style={styles.pageNumberBtn}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={page === totalPages}
                    style={styles.pageBtn}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Filter Modal for Mobile */}
      {showFilters && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                style={styles.closeButton}
              >
                <X size={24} />
              </button>
            </div>

            <div style={styles.mobileFilterContent}>
              {/* Categories */}
              <div style={styles.filterSection}>
                <h4 style={styles.filterTitle}>Category</h4>
                <div style={styles.filterList}>
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setPage(1);
                    }}
                    style={{
                      ...styles.categoryButton,
                      ...(selectedCategories.length === 0
                        ? styles.activeFilter
                        : {}),
                    }}
                  >
                    All Jewellery
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        toggleCategory(cat.id);
                      }}
                      style={{
                        ...styles.categoryButton,
                        ...(selectedCategories.includes(cat.id)
                          ? styles.activeFilter
                          : {}),
                      }}
                    >
                      {selectedCategories.includes(cat.id) && (
                        <span style={{ marginRight: "6px" }}>✓</span>
                      )}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div style={styles.filterSection}>
                <h4 style={styles.filterTitle}>Price Range</h4>
                <div style={styles.priceRangeList}>
                  {PRICE_RANGES.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handlePriceRangeSelect(range)}
                      style={{
                        ...styles.priceRangeButton,
                        ...(selectedPriceRange?.min === range.min
                          ? styles.activeFilter
                          : {}),
                      }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button onClick={clearAllFilters} style={styles.modalClearButton}>
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                style={styles.modalApplyButton}
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Grid CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          width: 100%;
          box-sizing: border-box;
          padding: 0;
          margin: 0;
        }

        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
          }
        }

        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
          }
        }

        /* Mobile card fixes */
        @media (max-width: 767px) {
          .grid {
            gap: 2px;
            padding: 0;
          }

          .product-card {
            overflow: hidden !important;
            box-sizing: border-box !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          .product-card img {
            width: 100% !important;
            height: auto !important;
            aspect-ratio: 1 / 1 !important;
            object-fit: cover !important;
          }

          .product-card > div:last-child {
            padding: 8px !important;
            box-sizing: border-box !important;
          }

          .product-name {
            font-size: 13px !important;
            line-height: 1.1 !important;
          }

          .product-current-price {
            font-size: 13px !important;
          }

          .product-original-price {
            font-size: 10px !important;
          }
        }

        /* Header responsive styles */
        .page-header {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .header-left {
          flex: 1;
          min-width: 150px;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 480px) {
          .page-header {
            flex-direction: column;
            align-items: stretch !important;
            gap: 12px;
          }

          .header-left {
            width: 100%;
          }

          .page-title {
            font-size: 20px !important;
          }

          .page-subtitle {
            font-size: 12px !important;
          }

          .header-controls {
            width: 100%;
            justify-content: space-between;
          }

          .sort-select {
            flex: 1;
            min-width: 0 !important;
            font-size: 13px !important;
            padding: 8px 28px 8px 10px !important;
          }

          .filter-button {
            padding: 8px 12px !important;
          }
        }

        @media (min-width: 481px) and (max-width: 640px) {
          .page-title {
            font-size: 22px !important;
          }

          .sort-select {
            min-width: 120px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AllJewelleryPage;

/* ================= STYLES ================= */

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: "12px",
    maxWidth: "100%",
    margin: "0",
    backgroundColor: "rgb(246, 242, 238)",
    minHeight: "100vh",
    boxSizing: "border-box",
    overflowX: "hidden",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(139, 94, 60, 0.1)",
    backgroundColor: "transparent",
  },

  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  title: {
    fontSize: "24px",
    fontWeight: "400",
    color: "#514242",
    letterSpacing: "-0.5px",
    margin: 0,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  subtitle: {
    fontSize: "14px",
    color: "#514242",
    fontWeight: "300",
    margin: 0,
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  headerControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  sortContainer: {
    position: "relative",
  },

  sortSelect: {
    padding: "8px 32px 8px 12px",
    borderRadius: "4px",
    border: "1px solid rgba(139, 94, 60, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    fontSize: "14px",
    cursor: "pointer",
    minWidth: "140px",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b5e3c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    backgroundSize: "16px",
    color: "#514242",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  filterButtonMobile: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "4px",
    border: "1px solid rgba(139, 94, 60, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    cursor: "pointer",
    position: "relative",
    fontSize: "14px",
    color: "#514242",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  filterBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    backgroundColor: "#D4AF37",
    color: "#000",
    fontSize: "10px",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
  },

  contentWrapper: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
  },

  sidebar: {
    width: "240px",
    flexShrink: 0,
    backgroundColor: "transparent",
    padding: "16px 0",
    height: "fit-content",
    display: "none",
  },

  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    padding: "0 16px",
  },

  sidebarTitleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  filterIcon: {
    color: "#666",
  },

  sidebarTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#514242",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: 0,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  clearButton: {
    fontSize: "12px",
    color: "#514242",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  filterSection: {
    marginBottom: "24px",
    padding: "0 16px",
  },

  filterTitle: {
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#514242",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  filterList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  categoryButton: {
    padding: "8px 12px",
    borderRadius: "2px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left",
    color: "#514242",
    transition: "all 0.2s ease",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  activeFilter: {
    backgroundColor: "#f8f8f8",
    color: "#514242",
    fontWeight: "500",
    opacity: 1,
  },

  priceRangeList: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  priceRangeButton: {
    padding: "8px 12px",
    borderRadius: "2px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left",
    color: "#514242",
    transition: "all 0.2s ease",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  customPrice: {
    marginTop: "16px",
  },

  priceInputs: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr auto",
    gap: "8px",
    alignItems: "center",
  },

  priceInput: {
    padding: "8px",
    borderRadius: "2px",
    border: "1px solid #e5e5e5",
    fontSize: "13px",
    width: "100%",
    color: "#514242",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  priceSeparator: {
    color: "#514242",
    fontSize: "13px",
    textAlign: "center",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 1,
  },

  applyButton: {
    padding: "8px 12px",
    borderRadius: "2px",
    backgroundColor: "#f0f0f0",
    color: "#514242",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "background-color 0.2s",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  activeFiltersSidebar: {
    marginTop: "24px",
    padding: "16px",
    backgroundColor: "#f8f8f8",
    borderRadius: "2px",
    borderTop: "1px solid #e5e5e5",
  },

  activeFiltersHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },

  activeFiltersTitle: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#514242",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  clearAllButton: {
    fontSize: "11px",
    color: "#514242",
    background: "none",
    border: "none",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  activeFiltersList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
  },

  activeFilterChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    backgroundColor: "#fff",
    borderRadius: "2px",
    fontSize: "11px",
    color: "#514242",
    border: "1px solid #e5e5e5",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  removeFilterButton: {
    background: "none",
    border: "none",
    color: "#999",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0",
  },

  mainContent: {
    width: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
    padding: "0",
  },

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    overflow: "hidden",
    border: "1px solid rgba(139, 94, 60, 0.08)",
    borderRadius: "6px",
    position: "relative",
    animation: "fadeIn 0.3s ease-out",
    boxSizing: "border-box",
    width: "100%",
    transition: "all 0.3s ease",
  },

  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: "1 / 1",
    overflow: "hidden",
    backgroundColor: "#faf8f5",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },

  discountBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "#000",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "2px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    zIndex: 2,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  categoryTag: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "rgba(255,255,255,0.9)",
    color: "#514242",
    fontSize: "10px",
    fontWeight: "500",
    padding: "4px 8px",
    borderRadius: "4px",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    zIndex: 3,
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  cardContent: {
    padding: "12px",
  },

  productName: {
    fontSize: "15px",
    fontWeight: "500",
    margin: "0 0 8px 0",
    color: "#3d3333",
    lineHeight: "1.2",
    letterSpacing: "0.3px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  priceContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  currentPrice: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#3d3333",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  originalPrice: {
    fontSize: "11px",
    color: "#514242",
    textDecoration: "line-through",
    marginLeft: "4px",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.5,
  },

  discountTag: {
    fontSize: "12px",
    color: "#B8860B",
    fontWeight: "800",
    marginLeft: "6px",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  priceRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "4px",
  },

  plusButton: {
    background: "none",
    border: "1px solid #e5e5e5",
    color: "#000",
    padding: "4px",
    borderRadius: "4px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },

  noResults: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    textAlign: "center",
  },

  noResultsText: {
    fontSize: "14px",
    color: "#514242",
    margin: "16px 0 24px 0",
    fontWeight: "300",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    textAlign: "center",
  },

  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(212, 175, 55, 0.1)",
    borderTop: "3px solid #D4AF37",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    fontSize: "14px",
    color: "#514242",
    margin: "16px 0 0 0",
    fontWeight: "300",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.7,
  },

  clearFiltersButton: {
    padding: "8px 20px",
    borderRadius: "2px",
    backgroundColor: "#514242",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "400",
    letterSpacing: "0.5px",
    transition: "background-color 0.2s",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #f0f0f0",
  },

  pageBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    borderRadius: "2px",
    border: "1px solid #e5e5e5",
    backgroundColor: "#fff",
    cursor: "pointer",
    minWidth: "36px",
    minHeight: "36px",
    transition: "all 0.2s",
  },

  pageNumbers: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
  },

  pageNumberBtn: {
    padding: "8px 12px",
    borderRadius: "2px",
    border: "1px solid #e5e5e5",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    minWidth: "36px",
    minHeight: "36px",
    transition: "all 0.2s",
    color: "#514242",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  activePage: {
    backgroundColor: "#514242",
    color: "#fff",
    borderColor: "#514242",
  },

  pageDots: {
    padding: "0 8px",
    color: "#514242",
    fontSize: "13px",
    fontFamily: '"Tenor Sans", sans-serif',
    opacity: 0.5,
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1000,
    display: "flex",
    alignItems: "flex-end",
  },

  modalContent: {
    backgroundColor: "rgb(246, 242, 238)",
    width: "100%",
    height: "70vh",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f0f0f0",
  },

  modalTitle: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#514242",
    margin: 0,
    fontFamily: '"Tenor Sans", sans-serif',
  },

  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#666",
    padding: "4px",
  },

  mobileFilterContent: {
    flex: 1,
    overflowY: "auto",
    paddingRight: "8px",
  },

  modalFooter: {
    display: "flex",
    gap: "8px",
    paddingTop: "20px",
    borderTop: "1px solid #f0f0f0",
  },

  modalClearButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "2px",
    border: "1px solid #e5e5e5",
    backgroundColor: "#fff",
    color: "#514242",
    fontSize: "14px",
    fontWeight: "400",
    cursor: "pointer",
    fontFamily: '"Tenor Sans", sans-serif',
  },

  modalApplyButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "2px",
    border: "none",
    backgroundColor: "#514242",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "400",
    cursor: "pointer",
    fontFamily: '"Tenor Sans", sans-serif',
  },
};
