import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Member } from "../backend.d";
import {
  useAddMember,
  useDeleteMember,
  useUpdateMember,
} from "../hooks/useQueries";
import { formatDate, formatFee, getMemberStatus } from "../lib/memberUtils";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { type MemberFormData, MemberModal } from "./MemberModal";

type FilterTab = "all" | "active" | "expired" | "expiring";

interface MembersTableProps {
  members: Member[];
  isAdmin: boolean;
}

export function MembersTable({ members, isAdmin }: MembersTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const addMutation = useAddMember();
  const updateMutation = useUpdateMember();
  const deleteMutation = useDeleteMember();

  const filtered = members
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q)
      );
    })
    .filter((m) => {
      if (filter === "all") return true;
      return getMemberStatus(m) === filter;
    });

  const handleAdd = () => {
    setEditMember(null);
    setModalOpen(true);
  };

  const handleEdit = (m: Member) => {
    setEditMember(m);
    setModalOpen(true);
  };

  const handleSubmit = async (data: MemberFormData) => {
    if (editMember) {
      const expiryDate = new Date(data.joiningDate);
      expiryDate.setMonth(expiryDate.getMonth() + data.planDuration);
      await updateMutation.mutateAsync({
        id: editMember.id,
        fullName: data.fullName,
        phone: data.phone,
        planDuration: BigInt(data.planDuration),
        feeAmount: BigInt(Math.round(data.feeAmount * 100)),
        joiningDate: BigInt(data.joiningDate.getTime()),
        paymentDate: BigInt(data.paymentDate.getTime()),
        expiryDate: BigInt(expiryDate.getTime()),
      });
      toast.success("Details Updated");
    } else {
      await addMutation.mutateAsync(data);
      toast.success("Member Added Successfully");
    }
    setModalOpen(false);
    setEditMember(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    toast.success("Member Deleted");
    setDeleteTarget(null);
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "expired", label: "Expired" },
    { key: "expiring", label: "Soon" },
  ];

  const statusBadge = (m: Member) => {
    const status = getMemberStatus(m);
    if (status === "expired")
      return (
        <Badge className="bg-status-expired/20 text-status-expired border-status-expired/30 text-xs">
          Expired
        </Badge>
      );
    if (status === "expiring")
      return (
        <Badge className="bg-status-expiring/20 text-status-expiring border-status-expiring/30 text-xs">
          Expiring Soon
        </Badge>
      );
    return (
      <Badge className="bg-status-active/20 text-status-active border-status-active/30 text-xs">
        Active
      </Badge>
    );
  };

  const rowClass = (m: Member) => {
    const status = getMemberStatus(m);
    if (status === "expired")
      return "bg-status-expired/8 hover:bg-status-expired/12";
    if (status === "expiring")
      return "bg-status-expiring/8 hover:bg-status-expiring/12";
    return "hover:bg-muted/30";
  };

  const ActionMenu = ({ m, idx }: { m: Member; idx: number }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent min-h-[44px] min-w-[44px] flex items-center justify-center"
          data-ocid={`members.dropdown_menu.${idx + 1}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card border-border text-foreground min-w-[160px]"
      >
        <DropdownMenuItem
          onClick={() => handleEdit(m)}
          className="flex items-center gap-2 cursor-pointer hover:bg-accent focus:bg-accent py-2.5"
          data-ocid={`members.edit_button.${idx + 1}`}
        >
          <Pencil className="h-4 w-4" />
          Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setDeleteTarget(m)}
          className="flex items-center gap-2 cursor-pointer text-destructive hover:text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 py-2.5"
          data-ocid={`members.delete_button.${idx + 1}`}
        >
          <Trash2 className="h-4 w-4" />
          Delete Member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground w-full sm:w-64"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="members.search_input"
          />
        </div>
        {isAdmin && (
          <Button
            type="button"
            onClick={handleAdd}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full sm:w-auto"
            data-ocid="members.open_modal_button"
          >
            <Plus className="h-4 w-4" />
            Add New Member
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 bg-secondary/50 p-1 rounded-lg"
        data-ocid="members.tab"
      >
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="members.tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="members.empty_state"
          >
            No members found.
          </div>
        ) : (
          filtered.map((m, idx) => {
            const status = getMemberStatus(m);
            let cardBorder = "border-border";
            if (status === "expired") cardBorder = "border-status-expired/30";
            if (status === "expiring") cardBorder = "border-status-expiring/30";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className={`bg-card border ${cardBorder} rounded-2xl p-4`}
                data-ocid={`members.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-semibold text-base truncate">
                      {m.fullName}
                    </p>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {m.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {statusBadge(m)}
                    {isAdmin && <ActionMenu m={m} idx={idx} />}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-muted-foreground text-xs">Plan</p>
                    <p className="text-foreground text-sm font-medium">
                      {String(m.planDuration)} mo
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Expiry</p>
                    <p className="text-foreground text-sm font-medium">
                      {m.expiryDate ? formatDate(m.expiryDate) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Fee</p>
                    <p className="text-foreground text-sm font-medium">
                      ${formatFee(m.feeAmount)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">
                Name
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Phone
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Plan
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Start Date
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Expiry Date
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Fee
              </TableHead>
              <TableHead className="text-muted-foreground font-medium">
                Status
              </TableHead>
              {isAdmin && (
                <TableHead className="text-muted-foreground font-medium text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 8 : 7}
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="members.empty_state"
                >
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m, idx) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={`border-border transition-colors ${rowClass(m)}`}
                  data-ocid={`members.item.${idx + 1}`}
                >
                  <TableCell className="text-foreground font-medium">
                    {m.fullName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {String(m.planDuration)} mo
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.joiningDate ? formatDate(m.joiningDate) : "\u2014"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {m.expiryDate ? formatDate(m.expiryDate) : "\u2014"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    ${formatFee(m.feeAmount)}
                  </TableCell>
                  <TableCell>{statusBadge(m)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <ActionMenu m={m} idx={idx} />
                    </TableCell>
                  )}
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MemberModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditMember(null);
        }}
        onSubmit={handleSubmit}
        editMember={editMember}
        isPending={isPending}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        memberName={deleteTarget?.fullName ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
