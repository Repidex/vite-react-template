import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  AddPhotoAlternate,
  Delete,
  Visibility,
  VisibilityOff,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { supabase } from "../../integrations/supabase/client";
import { toast } from "sonner";

interface SliderImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

const SliderManager = () => {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ================= FETCH ================= */
  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("slider_images")
        .select("*")
        .order("display_order");

      if (error) throw error;

      const formattedImages: SliderImage[] = (data || []).map((img) => ({
        id: img.id,
        title: img.title ?? "", // default empty string
        description: img.description ?? "",
        image_url: img.image_url,
        display_order: img.display_order ?? 0, // default 0
        is_active: img.is_active ?? false, // default false
        created_at: img.created_at,
        updated_at: img.updated_at,
      }));

      setSliderImages(formattedImages);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      toast.error("Failed to load sliders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  /* ================= ADD ================= */
  const handleAdd = async () => {
    if (!image) return toast.error("Select an image");

    setSubmitting(true);

    try {
      const ext = image.name.split(".").pop();
      const path = `slider/${crypto.randomUUID()}.${ext}`;

      await supabase.storage.from("shop_images").upload(path, image);
      const { data } = supabase.storage.from("shop_images").getPublicUrl(path);

      const maxOrder =
        sliderImages.length > 0
          ? Math.max(...sliderImages.map((i) => i.display_order))
          : 0;

      await supabase.from("slider_images").insert({
        image_url: data.publicUrl,
        title: title || null,
        description: description || null,
        display_order: maxOrder + 1,
        is_active: true,
      });

      toast.success("Slider added");
      setOpen(false);
      setImage(null);
      setTitle("");
      setDescription("");
      fetchImages();
    } catch {
      toast.error("Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= ACTIONS ================= */
  const toggleStatus = async (id: string, active: boolean) => {
    await supabase
      .from("slider_images")
      .update({ is_active: !active })
      .eq("id", id);
    fetchImages();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this slider?")) return;
    await supabase.from("slider_images").delete().eq("id", id);
    toast.success("Deleted");
    fetchImages();
  };

  const move = async (index: number, dir: "up" | "down") => {
    const target = dir === "up" ? index - 1 : index + 1;
    if (!sliderImages[target]) return;

    const a = sliderImages[index];
    const b = sliderImages[target];

    await supabase
      .from("slider_images")
      .update({ display_order: b.display_order })
      .eq("id", a.id);

    await supabase
      .from("slider_images")
      .update({ display_order: a.display_order })
      .eq("id", b.id);

    fetchImages();
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
            Slider Manager
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddPhotoAlternate />}
            onClick={() => setOpen(true)}
          >
            Add Slider
          </Button>
        </Stack>

        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Order</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sliderImages.map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Box
                      component="img"
                      src={s.image_url}
                      sx={{
                        width: 140,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={500}>{s.title || "—"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {s.description}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={s.is_active ? "Active" : "Inactive"}
                      color={s.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>{s.display_order}</TableCell>

                  <TableCell align="right">
                    <IconButton onClick={() => move(i, "up")}>
                      <ArrowUpward />
                    </IconButton>
                    <IconButton onClick={() => move(i, "down")}>
                      <ArrowDownward />
                    </IconButton>
                    <IconButton onClick={() => toggleStatus(s.id, s.is_active)}>
                      {s.is_active ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                    <IconButton color="error" onClick={() => remove(s.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* ADD DIALOG */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Slider Image</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, mt: 1 }}>
          <Button component="label" variant="outlined">
            Upload Image
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) setImage(e.target.files[0]);
              }}
            />
          </Button>

          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Description"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd} disabled={submitting}>
            {submitting ? "Uploading..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SliderManager;
