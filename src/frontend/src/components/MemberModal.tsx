import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Member } from "../backend.d";

interface MemberModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => void;
  editMember?: Member | null;
  isPending: boolean;
}

export interface MemberFormData {
  fullName: string;
  phone: string;
  planDuration: number;
  feeAmount: number;
  joiningDate: Date;
  paymentDate: Date;
}

const PLAN_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

function toInputDate(ts: bigint): string {
  return new Date(Number(ts)).toISOString().split("T")[0];
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MemberModal({
  open,
  onClose,
  onSubmit,
  editMember,
  isPending,
}: MemberModalProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [planDuration, setPlanDuration] = useState("1");
  const [feeAmount, setFeeAmount] = useState("");
  const [joiningDate, setJoiningDate] = useState(todayStr);
  const [paymentDate, setPaymentDate] = useState(todayStr);

  useEffect(() => {
    if (!open) return;
    if (editMember) {
      setFullName(editMember.fullName);
      setPhone(editMember.phone);
      setPlanDuration(String(editMember.planDuration));
      setFeeAmount(String(Number(editMember.feeAmount) / 100));
      setJoiningDate(
        editMember.joiningDate
          ? toInputDate(editMember.joiningDate)
          : todayStr(),
      );
      setPaymentDate(
        editMember.paymentDate
          ? toInputDate(editMember.paymentDate)
          : todayStr(),
      );
    } else {
      setFullName("");
      setPhone("");
      setPlanDuration("1");
      setFeeAmount("");
      setJoiningDate(todayStr());
      setPaymentDate(todayStr());
    }
  }, [open, editMember]);

  const expiryPreview = useMemo(() => {
    if (!joiningDate) return null;
    const base = new Date(joiningDate);
    if (Number.isNaN(base.getTime())) return null;
    const expiry = new Date(base);
    expiry.setMonth(expiry.getMonth() + Number(planDuration));
    return expiry;
  }, [joiningDate, planDuration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName,
      phone,
      planDuration: Number(planDuration),
      feeAmount: Number(feeAmount),
      joiningDate: new Date(joiningDate),
      paymentDate: new Date(paymentDate),
    });
  };

  const labelClass = "text-muted-foreground text-sm font-medium";
  const inputClass =
    "bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:ring-primary";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border text-foreground max-w-md"
        data-ocid="member.modal"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-semibold">
            {editMember ? "Edit Member" : "Add New Member"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className={labelClass}>Full Name</Label>
            <Input
              className={inputClass}
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              data-ocid="member.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Phone Number</Label>
            <Input
              className={inputClass}
              placeholder="+1 555 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              data-ocid="member.input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelClass}>Joining Date</Label>
              <Input
                type="date"
                className={inputClass}
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                required
                data-ocid="member.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Payment Date</Label>
              <Input
                type="date"
                className={inputClass}
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                data-ocid="member.input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelClass}>Plan Duration</Label>
              <Select value={planDuration} onValueChange={setPlanDuration}>
                <SelectTrigger
                  className={`${inputClass} w-full`}
                  data-ocid="member.select"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {PLAN_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "month" : "months"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Fee Amount ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                placeholder="0.00"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                required
                data-ocid="member.input"
              />
            </div>
          </div>

          {/* Expiry date preview */}
          {expiryPreview && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/40 border border-border/60">
              <CalendarClock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground leading-none mb-0.5">
                  Membership Expiry
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDisplayDate(expiryPreview)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              data-ocid="member.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="member.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : editMember ? (
                "Update Member"
              ) : (
                "Add Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
