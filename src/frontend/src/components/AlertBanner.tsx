import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Member } from "../backend.d";
import { getMemberStatus } from "../lib/memberUtils";

interface AlertBannerProps {
  members: Member[];
}

export function AlertBanner({ members }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const expiringSoon = members.filter((m) => getMemberStatus(m) === "expiring");

  if (expiringSoon.length === 0 || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 bg-status-expiring/15 border border-status-expiring/40 text-status-expiring rounded-xl px-4 py-3 mb-6"
        data-ocid="alert.panel"
      >
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <p className="text-sm font-medium flex-1">
          <span className="font-bold">
            {expiringSoon.length} membership{expiringSoon.length > 1 ? "s" : ""}
          </span>{" "}
          {expiringSoon.length > 1 ? "are" : "is"} expiring within the next 5
          days:{" "}
          {expiringSoon
            .slice(0, 3)
            .map((m) => m.fullName)
            .join(", ")}
          {expiringSoon.length > 3
            ? ` and ${expiringSoon.length - 3} more`
            : ""}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-status-expiring/70 hover:text-status-expiring transition-colors"
          aria-label="Dismiss alert"
          data-ocid="alert.close_button"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
