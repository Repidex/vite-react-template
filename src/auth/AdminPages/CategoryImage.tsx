import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Folder,
  Image as ImageIcon,
} from "@mui/icons-material";
import { supabase } from "../../integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

const CategoryManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description, image_url")
      .order("name");

    if (error) {
      toast.error("Failed to load categories");
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= RESET ================= */
  const resetForm = () => {
    setName("");
    setDescription("");
    setImage(null);
    setEditing(null);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!name.trim()) return toast.error("Category name required");

    setSaving(true);

    try {
      let imageUrl = editing?.image_url ?? null;

      if (image) {
        const ext = image.name.split(".").pop();
        const path = `categories/${crypto.randomUUID()}.${ext}`;

        await supabase.storage.from("shop_images").upload(path, image);
        const { data } = supabase.storage
          .from("shop_images")
          .getPublicUrl(path);

        imageUrl = data.publicUrl;
      }

      if (editing) {
        await supabase
          .from("categories")
          .update({
            name,
            description: description || null,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editing.id);

        toast.success("Category updated");
      } else {
        await supabase.from("categories").insert({
          name,
          description: description || null,
          image_url: imageUrl,
        });

        toast.success("Category created");
      }

      setOpen(false);
      resetForm();
      fetchCategories();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    await supabase.from("categories").delete().eq("id", id);
    toast.success("Category deleted");
    fetchCategories();
  };

  /* ================= EDIT ================= */
  const handleEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setDescription(c.description || "");
    setOpen(true);
  };

  /* ================= UI ================= */
  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight={600}>
            Category Manager
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Add Category
          </Button>
        </Stack>

        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : categories.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Folder sx={{ fontSize: 60, color: "text.disabled" }} />
            <Typography color="text.secondary" mt={2}>
              No categories found
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.image_url ? (
                      <Box
                        component="img"
                        src={c.image_url}
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 1,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <ImageIcon color="disabled" />
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={500}>{c.name}</Typography>
                  </TableCell>

                  <TableCell>
                    {c.description || "—"}
                  </TableCell>

                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(c)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(c.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* ===== DIALOG ===== */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? "Edit Category" : "Add Category"}
        </DialogTitle>

        <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
          <TextField
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button component="label" variant="outlined">
            Upload Image
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files && setImage(e.target.files[0])
              }
            />
          </Button>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CategoryManager;
