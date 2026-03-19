import type { Member } from "../backend.d";

export type MemberStatus = "active" | "expiring" | "expired";

export function getMemberStatus(member: Member): MemberStatus {
  const now = Date.now();
  const expiry = Number(member.expiryDate);
  const fiveDays = 5 * 24 * 60 * 60 * 1000;
  if (expiry < now) return "expired";
  if (expiry - now <= fiveDays) return "expiring";
  return "active";
}

export function formatDate(ts: bigint): string {
  return new Date(Number(ts)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatFee(feeAmount: bigint): string {
  return (Number(feeAmount) / 100).toFixed(2);
}
