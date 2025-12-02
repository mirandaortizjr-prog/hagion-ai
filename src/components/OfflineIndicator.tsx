import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNativeFeatures";

export const OfflineIndicator = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">You're offline</span>
      </div>
    </div>
  );
};
