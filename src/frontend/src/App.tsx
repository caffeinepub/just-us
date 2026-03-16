import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import LoginScreen from "./components/LoginScreen";
import ProfileSetup from "./components/ProfileSetup";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useSeedGamePrompts,
} from "./hooks/useQueries";
import Chat from "./pages/Chat";
import Dates from "./pages/Dates";
import Games from "./pages/Games";
import Home from "./pages/Home";
import Moments from "./pages/Moments";

type Tab = "home" | "dates" | "moments" | "chat" | "games";

const SEED_KEY = "justus_seeded";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const seedGamePrompts = useSeedGamePrompts();
  const { actor } = useActor();

  // Seed game prompts once after login
  // biome-ignore lint/correctness/useExhaustiveDependencies: seed once on mount
  useEffect(() => {
    if (!actor || !isAuthenticated) return;
    if (localStorage.getItem(SEED_KEY)) return;
    seedGamePrompts
      .mutateAsync()
      .then(() => {
        localStorage.setItem(SEED_KEY, "1");
      })
      .catch(() => {
        /* silent */
      });
  }, [actor, isAuthenticated]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-body">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <main>
        {activeTab === "home" && <Home />}
        {activeTab === "dates" && <Dates />}
        {activeTab === "moments" && <Moments />}
        {activeTab === "chat" && <Chat />}
        {activeTab === "games" && <Games />}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Footer */}
      <footer className="pb-24 px-5 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
