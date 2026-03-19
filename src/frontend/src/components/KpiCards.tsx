import { Clock, UserCheck, UserX, Users } from "lucide-react";
import { motion } from "motion/react";

interface KpiCardsProps {
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  expiringSoon: number;
}

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  delay: number;
}

function KpiCard({ title, value, icon, accent, delay }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3"
    >
      <div className={`p-3 rounded-xl w-fit ${accent}`}>{icon}</div>
      <div>
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {title}
        </p>
        <p className="text-foreground text-4xl font-bold mt-1 leading-none">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export function KpiCards({
  totalMembers,
  activeMembers,
  expiredMembers,
  expiringSoon,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <KpiCard
        title="Total"
        value={totalMembers}
        icon={<Users className="h-6 w-6 text-primary" />}
        accent="bg-primary/10"
        delay={0}
      />
      <KpiCard
        title="Active"
        value={activeMembers}
        icon={<UserCheck className="h-6 w-6 text-status-active" />}
        accent="bg-status-active/10"
        delay={0.07}
      />
      <KpiCard
        title="Expired"
        value={expiredMembers}
        icon={<UserX className="h-6 w-6 text-status-expired" />}
        accent="bg-status-expired/10"
        delay={0.14}
      />
      <KpiCard
        title="Expiring"
        value={expiringSoon}
        icon={<Clock className="h-6 w-6 text-status-expiring" />}
        accent="bg-status-expiring/10"
        delay={0.21}
      />
    </div>
  );
}
