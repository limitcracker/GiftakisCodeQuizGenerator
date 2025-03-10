import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import ClearStorage from "@/pages/ClearStorage";
import { QuizProvider } from "@/context/QuizContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/settings" component={Settings} />
      <Route path="/clear-storage" component={ClearStorage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QuizProvider>
        <Router />
        <Toaster />
        {/* Floating button in bottom right for troubleshooting */}
        <div className="fixed bottom-4 right-4 space-x-2">
          <Link href="/settings">
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg">
              ⚙️
            </button>
          </Link>
          <Link href="/clear-storage">
            <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg">
              🧹
            </button>
          </Link>
        </div>
      </QuizProvider>
    </QueryClientProvider>
  );
}

export default App;
