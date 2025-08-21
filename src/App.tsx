import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import Index from "./pages/Index";
import AboutPage from "./pages/About";
import AuthPage from "./pages/Auth";
import SchedulePage from "./pages/Schedule";
import DonatePage from "./pages/Donate";
import ShopPage from "./pages/Shop";
import GalleryPage from "./pages/Gallery";
import ContactPage from "./pages/Contact";
import AdminNewsletter from "./pages/AdminNewsletter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/mission" element={<AboutPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/donate" element={<DonatePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route 
              path="/admin/newsletter" 
              element={
                <AuthGuard requireAdmin={true}>
                  <AdminNewsletter />
                </AuthGuard>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
