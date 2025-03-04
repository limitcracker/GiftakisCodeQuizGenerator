import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ClearStorage from "@/pages/ClearStorage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/clear-storage" component={ClearStorage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
      {/* Floating button in bottom right for troubleshooting */}
      <div className="fixed bottom-4 right-4">
        <Link href="/clear-storage">
          <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg">
            🧹
          </button>
        </Link>
      </div>
    </QueryClientProvider>
  );
}

export default App;
