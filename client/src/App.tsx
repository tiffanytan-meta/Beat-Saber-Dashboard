import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Overview from "./pages/Overview";
import SalesOverall from "./pages/SalesOverall";
import IndividualPack from "./pages/IndividualPack";
import PackRelease from "./pages/PackRelease";
import SongMetrics from "./pages/SongMetrics";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/sales" component={SalesOverall} />
        <Route path="/pack/:packName?" component={IndividualPack} />
        <Route path="/release/:packName?" component={PackRelease} />
        <Route path="/songs/:packName?/:songName?" component={SongMetrics} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
