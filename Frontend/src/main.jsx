import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import "./index.css";
import "./styles/navbar.css";
import "./styles/home.css";
import "./styles/booking.css";
import "./styles/auth.css";
import "./styles/admin.css";
import "./styles/footer.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--card-bg)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
