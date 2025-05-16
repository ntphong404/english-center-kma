import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, Suspense } from "react";
import { publicRoutes } from "./routes/public.routes";
import { adminRoutes } from "./routes/admin.routes";
import { teacherRoutes } from "./routes/teacher.routes";
import { studentRoutes } from "./routes/student.routes";
import { parentRoutes } from "./routes/parent.routes";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <Routes>
              {publicRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
              <Route
                path={adminRoutes.path}
                element={adminRoutes.element}
              >
                {adminRoutes.children?.map((child) => (
                  <Route
                    key={child.path}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
              <Route
                path={teacherRoutes.path}
                element={teacherRoutes.element}
              >
                {teacherRoutes.children?.map((child) => (
                  <Route
                    key={child.path}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
              <Route
                path={studentRoutes.path}
                element={studentRoutes.element}
              >
                {studentRoutes.children?.map((child) => (
                  <Route
                    key={child.path}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
              <Route
                path={parentRoutes.path}
                element={parentRoutes.element}
              >
                {parentRoutes.children?.map((child) => (
                  <Route
                    key={child.path}
                    path={child.path}
                    element={child.element}
                  />
                ))}
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
