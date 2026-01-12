import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./providers/AuthProvider";
import { CartProvider } from "./providers/CartContext";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Toaster } from "sonner";
// import CartDrawer from "./components/CartDrawer";

// Create custom theme with Tenor Sans font
const theme = createTheme({
  typography: {
    fontFamily: '"Tenor Sans", sans-serif',
    allVariants: {
      fontFamily: '"Tenor Sans", sans-serif',
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" richColors />
          <ScrollToTop />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
