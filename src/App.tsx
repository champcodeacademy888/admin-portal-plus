import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/AdminLayout";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import ParentsPage from "./pages/ParentsPage";
import EnrolmentsPage from "./pages/EnrolmentsPage";
import PackagesPage from "./pages/PackagesPage";
import AttendancePage from "./pages/AttendancePage";
import MakeupsPage from "./pages/MakeupsPage";
import CoverPage from "./pages/CoverPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/parents" element={<ParentsPage />} />
            <Route path="/enrolments" element={<EnrolmentsPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/makeups" element={<MakeupsPage />} />
            <Route path="/cover" element={<CoverPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
