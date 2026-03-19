import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Member } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllMembers() {
  const { actor, isFetching } = useActor();
  return useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDashboardStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (member: {
      fullName: string;
      phone: string;
      planDuration: number;
      feeAmount: number;
      joiningDate: Date;
      paymentDate: Date;
    }) => {
      if (!actor) throw new Error("Not connected");
      const id = crypto.randomUUID();
      const planMonths = member.planDuration;
      const joiningMs = BigInt(member.joiningDate.getTime());
      const paymentMs = BigInt(member.paymentDate.getTime());
      const expiryDate = new Date(member.joiningDate);
      expiryDate.setMonth(expiryDate.getMonth() + planMonths);
      const expiryMs = BigInt(expiryDate.getTime());
      const feeAmountBigint = BigInt(Math.round(member.feeAmount * 100));
      await actor.addMember(
        id,
        member.fullName,
        member.phone,
        BigInt(planMonths),
        feeAmountBigint,
      );
      await actor.updateMember({
        id,
        fullName: member.fullName,
        phone: member.phone,
        planDuration: BigInt(planMonths),
        feeAmount: feeAmountBigint,
        joiningDate: joiningMs,
        paymentDate: paymentMs,
        expiryDate: expiryMs,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (member: Member) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateMember(member);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteMember(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}
