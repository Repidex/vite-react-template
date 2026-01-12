import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Modal,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  alpha,
  Fade,
  Backdrop,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  HistoryOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { supabase } from "../integrations/supabase/client";
import type { Json } from "../integrations/supabase/types";

// Types
interface SearchItem {
  id: string;
  name: string;
  price: number;
  image_url: Json | null;
  category_id?: string | null;
  categories?: { name: string } | null;
  description?: string | null;
  discount?: number | null;
  default_discount_percentage?: number | null;
}

// Styled components
const SearchModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  "& .MuiBackdrop-root": {
    backgroundColor: alpha(theme.palette.common.black, 0.5),
  },
}));

const SearchContainer = styled(Paper)(({ theme }) => ({
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  outline: "none",

  // Mobile: Fullscreen
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
    margin: 0,
  },

  // Desktop: Centered modal
  [theme.breakpoints.up("sm")]: {
    width: "500px",
    maxWidth: "90vw",
    maxHeight: "80vh",
    borderRadius: 8,
    marginTop: "10vh",
    boxShadow: theme.shadows[4],
  },
}));

const SearchHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
}));

const SearchInput = styled(TextField)(() => ({
  flex: 1,
  "& .MuiOutlinedInput-root": {
    borderRadius: 4,
    "& fieldset": {
      border: "none",
    },
  },
}));

const SearchResultItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  "&:hover": {
    backgroundColor: alpha(theme.palette.action.hover, 0.5),
  },
}));

interface SearchBarProps {
  open: boolean;
  onClose: () => void;
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const SearchBar: React.FC<SearchBarProps> = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popularItems, setPopularItems] = useState<SearchItem[]>([]);
  const navigate = useNavigate();

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch popular/trending items on mount
  useEffect(() => {
    if (open) {
      fetchPopularItems();
    }
  }, [open]);

  const fetchPopularItems = async () => {
    try {
      const { data } = await supabase
        .from("items")
        .select(
          `id, name, price, image_url, description, discount, default_discount_percentage, categories(name)`
        )
        .limit(5);

      if (data) {
        setPopularItems(data);
      }
    } catch (error) {
      console.error("Error fetching popular items:", error);
    }
  };

  // Search items with fuzzy matching
  const searchItems = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchTerm = query.trim().toLowerCase();

      // Split search into words for better matching
      const words = searchTerm.split(/\s+/).filter((w) => w.length > 0);

      // Build search pattern - search for items matching any word in name or description
      // Note: We can't use OR with joined tables, so we search name/description then filter by category client-side
      const conditions: string[] = [];
      for (const word of words) {
        const esc = word.replace(/%/g, "\\%");
        conditions.push(`name.ilike.%${esc}%`);
        conditions.push(`description.ilike.%${esc}%`);
      }

      const orQuery = conditions.join(",");
      const { data, error } = await supabase
        .from("items")
        .select(
          `id, name, price, image_url, description, discount, default_discount_percentage, category_id, categories(name)`
        )
        .or(orQuery)
        .limit(50); // Fetch more to filter by category

      if (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        return;
      }

      if (data && data.length > 0) {
        // Client-side filter to include category matches
        const filteredResults = data.filter((item) => {
          const nameMatch = item.name.toLowerCase();
          const descMatch = (item.description || "").toLowerCase();
          const catMatch = (item.categories?.name || "").toLowerCase();
          
          return words.some(w => 
            nameMatch.includes(w) || 
            descMatch.includes(w) || 
            catMatch.includes(w)
          );
        });

        // Sort results by relevance (exact matches first, then partial)
        const sortedResults = filteredResults.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          // Exact match gets highest priority
          const aExact = aName === searchTerm ? 3 : 0;
          const bExact = bName === searchTerm ? 3 : 0;

          // Starts with search term gets second priority
          const aStarts = aName.startsWith(searchTerm) ? 2 : 0;
          const bStarts = bName.startsWith(searchTerm) ? 2 : 0;

          // Contains search term gets third priority
          const aContains = aName.includes(searchTerm) ? 1 : 0;
          const bContains = bName.includes(searchTerm) ? 1 : 0;

          // Word match count (check in name and description and category)
          const aWordMatches = words.filter(
            (w) =>
              aName.includes(w) ||
              (a.description || "").toLowerCase().includes(w) ||
              (a.categories?.name || "").toLowerCase().includes(w)
          ).length;
          const bWordMatches = words.filter(
            (w) =>
              bName.includes(w) ||
              (b.description || "").toLowerCase().includes(w) ||
              (b.categories?.name || "").toLowerCase().includes(w)
          ).length;

          const aScore = aExact + aStarts + aContains + aWordMatches;
          const bScore = bExact + bStarts + bContains + bWordMatches;

          return bScore - aScore;
        });

        setSearchResults(sortedResults.slice(0, 20)); // Limit to 20 results
      } else {
        // No exact matches found - try broader fuzzy search
        // Search with each character having wildcards for typo tolerance
        const fuzzyPattern = searchTerm.split("").join("%");
        const fuzzyConditions = [
          `name.ilike.%${fuzzyPattern}%`,
          `description.ilike.%${fuzzyPattern}%`,
        ].join(",");

        const { data: fuzzyData } = await supabase
          .from("items")
          .select(
            `id, name, price, image_url, description, discount, default_discount_percentage, category_id, categories(name)`
          )
          .or(fuzzyConditions)
          .limit(10);

        setSearchResults(fuzzyData || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger search when debounced query changes
  useEffect(() => {
    searchItems(debouncedSearch);
  }, [debouncedSearch, searchItems]);

  // Clear search state when modal is closed
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
      setIsLoading(false);
    }
  }, [open]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery("");
    }
  };

  const handleItemClick = (item: SearchItem) => {
    navigate(`/product/${item.id}`, {
      state: {
        item: {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: getImageUrl(item.image_url) ? [getImageUrl(item.image_url)!] : [],
          category_id: item.category_id,
        },
      },
    });
    onClose();
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const calculateDiscount = (item: SearchItem) => {
    // Use explicit discount percentage if available
    if (
      item.default_discount_percentage &&
      item.default_discount_percentage > 0
    ) {
      return Math.round(item.default_discount_percentage);
    }
    // Calculate from discount amount if available
    if (item.discount && item.discount > 0) {
      return Math.round((item.discount / item.price) * 100);
    }
    return 0;
  };

  const getOriginalPrice = (item: SearchItem) => {
    if (item.discount && item.discount > 0) {
      return item.price + item.discount;
    }
    if (
      item.default_discount_percentage &&
      item.default_discount_percentage > 0
    ) {
      return Math.round(
        item.price / (1 - item.default_discount_percentage / 100)
      );
    }
    return null;
  };

  const getImageUrl = (imageUrl: Json | null): string | undefined => {
    if (!imageUrl) return undefined;
    if (Array.isArray(imageUrl)) {
      return imageUrl[0] as string;
    }
    if (typeof imageUrl === "string") {
      return imageUrl;
    }
    return undefined;
  };

  return (
    <SearchModal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
    >
      <Fade in={open} timeout={200}>
        <SearchContainer elevation={0}>
          {/* Search Header */}
          <SearchHeader>
            <SearchInput
              autoFocus
              fullWidth
              placeholder="Search jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              InputProps={{
                sx: {
                  fontSize: "1rem",
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : searchQuery ? (
                      <IconButton
                        size="small"
                        onClick={() => setSearchQuery("")}
                        edge="end"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </InputAdornment>
                ),
              }}
            />
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </SearchHeader>

          {/* Search Content */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {searchQuery.trim() ? (
              // Search Results
              <Box sx={{ p: 2 }}>
                {isLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <CircularProgress size={32} />
                  </Box>
                ) : searchResults.length > 0 ? (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 2,
                        color: "text.secondary",
                      }}
                    >
                      Found {searchResults.length} result
                      {searchResults.length !== 1 ? "s" : ""} for "{searchQuery}
                      "
                    </Typography>
                    <List disablePadding>
                      {searchResults.map((item) => {
                        const discount = calculateDiscount(item);
                        const originalPrice = getOriginalPrice(item);
                        return (
                          <SearchResultItem
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            sx={{ cursor: "pointer", borderRadius: 1, mb: 0.5 }}
                          >
                            <ListItemAvatar>
                              <Avatar
                                variant="rounded"
                                src={getImageUrl(item.image_url)}
                                alt={item.name}
                                sx={{ width: 48, height: 48 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 500,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.name}
                                </Typography>
                              }
                              secondary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mt: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      color: "text.primary",
                                    }}
                                  >
                                    ₹{item.price.toLocaleString()}
                                  </Typography>
                                  {originalPrice &&
                                    originalPrice > item.price && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          textDecoration: "line-through",
                                          color: "text.disabled",
                                        }}
                                      >
                                        ₹{originalPrice.toLocaleString()}
                                      </Typography>
                                    )}
                                  {discount > 0 && (
                                    <Chip
                                      label={`-${discount}%`}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: "0.65rem",
                                        bgcolor: "#D4AF37",
                                        color: "#000",
                                      }}
                                    />
                                  )}
                                  {item.categories?.name && (
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "text.secondary" }}
                                    >
                                      • {item.categories.name}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </SearchResultItem>
                        );
                      })}
                    </List>
                    {searchResults.length >= 5 && (
                      <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "primary.main",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" },
                          }}
                          onClick={handleSearchSubmit}
                        >
                          View all results →
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      No results found for "{searchQuery}"
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.disabled" }}>
                      Try different keywords or check spelling
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              // Popular/Trending Items when no search
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <TrendingUpOutlined fontSize="small" />
                  Popular Items
                </Typography>
                <List disablePadding>
                  {popularItems.map((item) => (
                    <SearchResultItem
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      sx={{ cursor: "pointer", borderRadius: 1, mb: 0.5 }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          variant="rounded"
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          sx={{ width: 40, height: 40 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary" }}
                          >
                            ₹{item.price.toLocaleString()}
                            {item.categories?.name &&
                              ` • ${item.categories.name}`}
                          </Typography>
                        }
                      />
                    </SearchResultItem>
                  ))}
                </List>

                {/* Quick search suggestions */}
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1.5,
                      color: "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <HistoryOutlined fontSize="small" />
                    Quick Search
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {[
                      "Rings",
                      "Necklace",
                      "Earrings",
                      "Bracelet",
                      "Gold",
                      "Silver",
                      "Diamond",
                    ].map((term) => (
                      <Chip
                        key={term}
                        label={term}
                        size="small"
                        onClick={() => setSearchQuery(term)}
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </SearchContainer>
      </Fade>
    </SearchModal>
  );
};

export default SearchBar;
