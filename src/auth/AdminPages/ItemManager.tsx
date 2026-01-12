import { useState, useEffect } from "react";
import { supabase } from "../../integrations/supabase/client";
import Grid from "@mui/material/Grid";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Image as ImageIcon,
  LocalOffer as CouponIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string[] | null;
  category_id: string;
  category_name?: string;
  default_discount_percentage: number;
  stock: number;
  is_featured: boolean;
  size?: string;
}

interface ItemCoupon {
  id: string;
  item_id: string;
  code: string;
  discount_percentage: number;
  is_active: boolean;
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const sizeOptionsByCategory: Record<string, string[]> = {
  "Mens Rings": ["7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
  "Mens Chains": [
    "16 inch",
    "18 inch",
    "20 inch",
    "22 inch",
    "24 inch",
    "26 inch",
    "28 inch",
    "30 inch",
    "32 inch",
  ],
  "Mens Bracelets": ["Small", "Medium", "Large", "Extra Large", "Adjustable"],
  "Female Rings": [
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
  ],
  "Female Chains": [
    "12 inch",
    "14 inch",
    "16 inch",
    "18 inch",
    "20 inch",
    "22 inch",
    "24 inch",
    "26 inch",
    "30 inch",
  ],
  "Female Bracelets": [
    "Child Small",
    "Child Medium",
    "Child Large",
    "Small",
    "Medium",
    "Large",
    "Extra Large",
    "Adjustable",
  ],
  "Female Earrings": [
    "Toddler",
    "Small",
    "Medium",
    "Large",
    "Hoop Small",
    "Hoop Medium",
    "Hoop Large",
    "Stud Small",
    "Stud Medium",
    "Stud Large",
  ],
};

const ItemManager = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemCoupons, setItemCoupons] = useState<ItemCoupon[]>([]);
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Form state
  const [formState, setFormState] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    images: [] as File[],
    deletedImages: [] as string[],
    default_discount_percentage: "0",
    stock: "0",
    is_featured: false,
    size: "",
  });

  // Coupon form state
  const [couponFormState, setCouponFormState] = useState({
    code: "",
    discount_percentage: "0",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("items")
        .select(
          `
        id, 
        name, 
        description, 
        price, 
        image_url, 
        category_id,
        default_discount_percentage,
        stock,
        categories(name),
        is_featured,
        size
      `
        )
        .order("name");

      if (error) throw error;

      const formattedItems: Item[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? null,
        price: item.price ?? 0,
        image_url: Array.isArray(item.image_url)
          ? item.image_url.filter(
              (img): img is string => typeof img === "string"
            )
          : item.image_url
          ? [String(item.image_url)]
          : null,
        category_id: item.category_id ?? "",
        category_name: item.categories?.name,
        default_discount_percentage: item.default_discount_percentage ?? 0,
        stock: item.stock ?? 0,
        is_featured: item.is_featured ?? false,
        size: item.size ?? undefined,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      showSnackbar("Failed to load items", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      showSnackbar("Failed to load categories", "error");
    }
  };

  const fetchItemCoupons = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from("item_coupons")
        .select("*")
        .eq("item_id", itemId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCoupons: ItemCoupon[] = (data || []).map((coupon) => ({
        id: coupon.id,
        item_id: coupon.item_id ?? "", // replace null with empty string
        code: coupon.code,
        discount_percentage: coupon.discount_percentage ?? 0,
        is_active: coupon.is_active ?? false, // default false if null
        created_at: coupon.created_at,
        updated_at: coupon.updated_at,
      }));

      setItemCoupons(formattedCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      showSnackbar("Failed to load coupons", "error");
    }
  };

  useEffect(() => {
    Promise.all([fetchItems(), fetchCategories()]);
  }, []);

  const resetForm = () => {
    setFormState({
      name: "",
      description: "",
      price: "",
      category_id: "",
      images: [],
      deletedImages: [],
      default_discount_percentage: "0",
      stock: "0",
      is_featured: false,
      size: "",
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormState({
        name: item.name,
        description: item.description || "",
        price: String(item.price),
        category_id: item.category_id,
        images: [],
        deletedImages: [],
        default_discount_percentage: String(item.default_discount_percentage),
        stock: String(item.stock),
        is_featured: item.is_featured,
        size: item.size || "",
      });
      fetchItemCoupons(item.id);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (formState.images.length + newFiles.length > 5) {
        showSnackbar("Maximum 5 images allowed", "error");
        return;
      }
      setFormState((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = (imageUrl: string) => {
    setFormState((prev) => ({
      ...prev,
      deletedImages: [...prev.deletedImages, imageUrl],
    }));
  };

  const validateForm = () => {
    if (!formState.name.trim()) {
      showSnackbar("Item name is required", "error");
      return false;
    }

    if (
      !formState.price ||
      isNaN(Number(formState.price)) ||
      Number(formState.price) <= 0
    ) {
      showSnackbar("Please enter a valid price", "error");
      return false;
    }

    if (!formState.category_id) {
      showSnackbar("Please select a category", "error");
      return false;
    }

    if (isNaN(Number(formState.stock)) || Number(formState.stock) < 0) {
      showSnackbar("Please enter a valid stock quantity", "error");
      return false;
    }

    if (!editingItem && formState.images.length === 0) {
      showSnackbar("Please upload at least one image", "error");
      return false;
    }

    if (editingItem) {
      const remainingExistingImages = (editingItem.image_url || []).filter(
        (url) => !formState.deletedImages.includes(url)
      ).length;
      const totalImages = remainingExistingImages + formState.images.length;

      if (totalImages === 0) {
        showSnackbar("At least one image is required", "error");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let imageUrls: string[] = editingItem?.image_url || [];

      // Remove deleted images
      if (formState.deletedImages.length > 0) {
        imageUrls = imageUrls.filter(
          (url) => !formState.deletedImages.includes(url)
        );
      }

      // Upload new images
      if (formState.images.length > 0) {
        const uploadPromises = formState.images.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()
            .toString(36)
            .substring(2, 15)}.${fileExt}`;
          const filePath = `items/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("shop_images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("shop_images")
            .getPublicUrl(filePath);

          return publicUrlData.publicUrl;
        });

        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Delete removed images from storage
      if (formState.deletedImages.length > 0) {
        const deletePromises = formState.deletedImages.map(
          async (imageUrl: string) => {
            const path = imageUrl.split("/").pop();
            if (path) {
              await supabase.storage
                .from("shop_images")
                .remove([`items/${path}`]);
            }
          }
        );
        await Promise.all(deletePromises);
      }

      const itemData = {
        name: formState.name,
        description: formState.description || null,
        price: Number(formState.price),
        category_id: formState.category_id,
        image_url: imageUrls,
        default_discount_percentage: Number(
          formState.default_discount_percentage
        ),
        stock: Number(formState.stock),
        is_featured: formState.is_featured,
        updated_at: new Date().toISOString(),
        size: formState.size || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("items")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;
        showSnackbar("Item updated successfully");
      } else {
        const { error } = await supabase.from("items").insert(itemData);

        if (error) throw error;
        showSnackbar("Item created successfully");
      }

      resetForm();
      setIsDialogOpen(false);
      fetchItems();
    } catch (error) {
      console.error("Error saving item:", error);
      showSnackbar(
        editingItem ? "Failed to update item" : "Failed to create item",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const { data: item, error } = await supabase
        .from("items")
        .select("image_url")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Make sure image_url is an array of strings
      const imageUrls: string[] = Array.isArray(item?.image_url)
        ? item.image_url.filter((img): img is string => typeof img === "string")
        : item?.image_url
        ? [String(item.image_url)]
        : [];

      if (imageUrls.length > 0) {
        const deletePromises = imageUrls.map(async (imageUrl) => {
          const path = imageUrl.split("/").pop();
          if (path) {
            await supabase.storage
              .from("shop_images")
              .remove([`items/${path}`]);
          }
        });
        await Promise.all(deletePromises);
      }

      const { error: deleteError } = await supabase
        .from("items")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      showSnackbar("Item deleted successfully");
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      showSnackbar("Failed to delete item", "error");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleOpenCouponDialog = async (itemId: string) => {
    setSelectedItemId(itemId);
    await fetchItemCoupons(itemId);
    setIsCouponDialogOpen(true);
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;

    try {
      const { error } = await supabase.from("item_coupons").insert({
        item_id: selectedItemId,
        code: couponFormState.code,
        discount_percentage: Number(couponFormState.discount_percentage),
      });

      if (error) throw error;

      showSnackbar("Coupon added successfully");
      setCouponFormState({ code: "", discount_percentage: "0" });
      fetchItemCoupons(selectedItemId);
    } catch (error) {
      console.error("Error adding coupon:", error);
      showSnackbar("Failed to add coupon", "error");
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from("item_coupons")
        .delete()
        .eq("id", couponId);

      if (error) throw error;

      showSnackbar("Coupon deleted successfully");
      if (selectedItemId) {
        fetchItemCoupons(selectedItemId);
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      showSnackbar("Failed to delete coupon", "error");
    }
  };

  const handleToggleCouponStatus = async (
    couponId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("item_coupons")
        .update({ is_active: !currentStatus })
        .eq("id", couponId);

      if (error) throw error;

      showSnackbar(
        `Coupon ${currentStatus ? "deactivated" : "activated"} successfully`
      );
      if (selectedItemId) {
        fetchItemCoupons(selectedItemId);
      }
    } catch (error) {
      console.error("Error updating coupon status:", error);
      showSnackbar("Failed to update coupon status", "error");
    }
  };

  const handleToggleFeatured = async (item: Item) => {
    try {
      const { error } = await supabase
        .from("items")
        .update({ is_featured: !item.is_featured })
        .eq("id", item.id);

      if (error) throw error;

      showSnackbar(
        `Item ${item.is_featured ? "removed from" : "added to"} featured items`
      );
      fetchItems();
    } catch (error) {
      console.error("Error updating item status:", error);
      showSnackbar("Failed to update item status", "error");
    }
  };

  const getCurrentCategoryName = () => {
    return (
      categories.find((cat) => cat.id === formState.category_id)?.name || ""
    );
  };

  const getSizeOptions = () => {
    const categoryName = getCurrentCategoryName();
    return categoryName ? sizeOptionsByCategory[categoryName] || [] : [];
  };

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
          Manage Items
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add New Item
        </Button>
      </Box>

      {/* Item Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Item Name"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  value={formState.price}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formState.category_id}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        category_id: e.target.value,
                      }))
                    }
                    label="Category"
                    required
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  type="number"
                  value={formState.stock}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  required
                  margin="normal"
                />
              </Grid>

              {getSizeOptions().length > 0 && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Size</InputLabel>
                    <Select
                      value={formState.size}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          size: e.target.value,
                        }))
                      }
                      label="Size"
                    >
                      <MenuItem value="">
                        <em>Select size (optional)</em>
                      </MenuItem>
                      {getSizeOptions().map((size) => (
                        <MenuItem key={size} value={size}>
                          {size}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formState.description}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Default Discount</InputLabel>
                  <Select
                    value={formState.default_discount_percentage}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        default_discount_percentage: e.target.value,
                      }))
                    }
                    label="Default Discount"
                  >
                    {Array.from({ length: 11 }, (_, i) => i * 10).map(
                      (value) => (
                        <MenuItem key={value} value={String(value)}>
                          {value}%
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formState.is_featured}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          is_featured: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Featured Item"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Images {editingItem ? "(Optional)" : "(Required)"} - Max 5
                </Typography>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Images
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </Button>

                <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                  {editingItem
                    ? `${
                        formState.images.length +
                        (editingItem.image_url?.filter(
                          (url) => !formState.deletedImages.includes(url)
                        ).length || 0)
                      }/5 images selected`
                    : `${formState.images.length}/5 images selected`}
                </Typography>

                {formState.images.length > 0 && (
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {formState.images.map((file, index) => (
                      <Grid item key={index}>
                        <Box
                          sx={{ position: "relative", width: 100, height: 100 }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeImage(index)}
                            sx={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              bgcolor: "error.main",
                              color: "white",
                              "&:hover": { bgcolor: "error.dark" },
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {editingItem &&
                  editingItem.image_url &&
                  editingItem.image_url.length > 0 && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Current Images:
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        {editingItem.image_url
                          .filter(
                            (imageUrl) =>
                              !formState.deletedImages.includes(imageUrl)
                          )
                          .map((imageUrl, index) => (
                            <Grid item key={index}>
                              <Box
                                sx={{
                                  position: "relative",
                                  width: 100,
                                  height: 100,
                                }}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Current ${index + 1}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => removeExistingImage(imageUrl)}
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    bgcolor: "error.main",
                                    color: "white",
                                    "&:hover": { bgcolor: "error.dark" },
                                  }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Grid>
                          ))}
                      </Grid>
                    </>
                  )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editingItem
                ? "Update Item"
                : "Create Item"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog
        open={isCouponDialogOpen}
        onClose={() => setIsCouponDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Manage Coupons</DialogTitle>
        <form onSubmit={handleAddCoupon}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Coupon Code"
                  value={couponFormState.code}
                  onChange={(e) =>
                    setCouponFormState((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Discount Percentage</InputLabel>
                  <Select
                    value={couponFormState.discount_percentage}
                    onChange={(e) =>
                      setCouponFormState((prev) => ({
                        ...prev,
                        discount_percentage: e.target.value,
                      }))
                    }
                    label="Discount Percentage"
                  >
                    {Array.from({ length: 11 }, (_, i) => i * 10).map(
                      (value) => (
                        <MenuItem key={value} value={String(value)}>
                          {value}%
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button type="submit" variant="contained" sx={{ mb: 3 }}>
              Add Coupon
            </Button>

            <Typography variant="h6" gutterBottom>
              Existing Coupons
            </Typography>

            <Stack spacing={2}>
              {itemCoupons.map((coupon) => (
                <Paper key={coupon.id} sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{coupon.code}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {coupon.discount_percentage}% off
                      </Typography>
                    </Box>
                    <Box>
                      <Chip
                        label={coupon.is_active ? "Active" : "Inactive"}
                        color={coupon.is_active ? "success" : "default"}
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() =>
                          handleToggleCouponStatus(coupon.id, coupon.is_active)
                        }
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}

              {itemCoupons.length === 0 && (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ py: 4 }}
                >
                  No coupons added yet
                </Typography>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsCouponDialogOpen(false)}>Close</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Items Table */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <ImageIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No items found
            </Typography>
            {categories.length > 0 ? (
              <Button
                variant="contained"
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Add Your First Item
              </Button>
            ) : (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You need to create a category first
                </Alert>
                <Button variant="outlined">Go to Categories</Button>
              </Box>
            )}
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S.N.</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Default Discount</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.image_url && item.image_url.length > 0 ? (
                      <img
                        src={item.image_url[0]}
                        alt={item.name}
                        style={{ width: 60, height: 60, objectFit: "cover" }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "grey.100",
                        }}
                      >
                        <ImageIcon color="disabled" />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {item.name}
                    </Typography>
                    {item.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 300 }}
                      >
                        {item.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{item.category_name}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {formatPrice(item.price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{item.stock}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {item.default_discount_percentage}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleToggleFeatured(item)}
                      color={item.is_featured ? "warning" : "default"}
                    >
                      {item.is_featured ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenCouponDialog(item.id)}
                        color="secondary"
                      >
                        <CouponIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ItemManager;
