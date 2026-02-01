import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";

import Series from "./pages/Series";
import SeriesDetail from "./pages/SeriesDetail";
import SeriesPost from "./pages/SeriesPost";
import About from "./pages/About";
import Resume from "./pages/Resume";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            <Route path="/series" element={<Series />} />
            <Route path="/series/:seriesId" element={<SeriesDetail />} />
            <Route
              path="/series/:seriesId/:postSlug"
              element={<SeriesPost />}
            />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
