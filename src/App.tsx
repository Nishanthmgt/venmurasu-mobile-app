import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AllBooks from "./pages/AllBooks.tsx";
import BookPage from "./pages/BookPage.tsx";
import PartPage from "./pages/PartPage.tsx";
import Relationships from "./pages/Relationships.tsx";
import CommunityPage from "./pages/CommunityPage.tsx";
import ToughWords from "./pages/ToughWords.tsx";
import MapPage from "./pages/MapPage.tsx";
import Bookmarks from "./pages/Bookmarks.tsx";
import Settings from "./pages/Settings.tsx";
import About from "./pages/About.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminBooks from "./pages/admin/AdminBooks.tsx";
import AdminChapters from "./pages/admin/AdminChapters.tsx";
import AdminParts from "./pages/admin/AdminParts.tsx";
import AdminGlossary from "./pages/admin/AdminGlossary.tsx";
import AdminRelationships from "./pages/admin/AdminRelationships.tsx";
import AdminMap from "./pages/admin/AdminMap.tsx";

const queryClient = new QueryClient();

const App = () => {
  const isUserMode = import.meta.env.VITE_APP_MODE !== 'admin';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            {isUserMode ? (
              <>
                <Route path="/" element={<Index />} />
                <Route path="/books" element={<AllBooks />} />
                <Route path="/book/:bookSlug" element={<BookPage />} />
                <Route path="/book/:bookSlug/chapter/:chapterSlug/part/:partSlug" element={<PartPage />} />
                <Route path="/relationships" element={<Relationships />} />
                <Route path="/relationships/:communityId" element={<CommunityPage />} />
                <Route path="/glossary" element={<ToughWords />} />
                <Route path="/tough-words" element={<ToughWords />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
              </>
            ) : (
              <>
                <Route path="/" element={<AdminLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminBooks />} />
                  <Route path="books/:bookId/chapters" element={<AdminChapters />} />
                  <Route path="chapters/:chapterId/parts" element={<AdminParts />} />
                  <Route path="glossary" element={<AdminGlossary />} />
                  <Route path="relationships" element={<AdminRelationships />} />
                  <Route path="map" element={<AdminMap />} />
                </Route>
              </>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
