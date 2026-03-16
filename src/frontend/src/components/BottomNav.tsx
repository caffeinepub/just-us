import { Calendar, Camera, Dices, Heart, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

type Tab = "home" | "dates" | "moments" | "chat" | "games";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: {
  id: Tab;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  ocid: string;
}[] = [
  { id: "home", icon: Heart, label: "Home", ocid: "nav.home.tab" },
  { id: "dates", icon: Calendar, label: "Dates", ocid: "nav.dates.tab" },
  { id: "moments", icon: Camera, label: "Moments", ocid: "nav.moments.tab" },
  { id: "chat", icon: MessageCircle, label: "Chat", ocid: "nav.chat.tab" },
  { id: "games", icon: Dices, label: "Games", ocid: "nav.games.tab" },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border/50 shadow-soft">
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-ocid={tab.ocid}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-[52px]"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-medium relative z-10 transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
