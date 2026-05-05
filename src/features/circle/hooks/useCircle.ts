import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { circleService, invitationService } from '../services';
import type { CircleMember, CircleInvitation, CirclePermissions, CircleRole } from '../types';

const STALE_TIME = 2 * 60 * 1000;

export const useCircle = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;
  const userEmail = user?.email;
  const userName = user?.name;

  const [sharingEnabled, setSharingEnabled] = useState(true);

  const membersQuery = useQuery({
    queryKey: ['circle-members', userId],
    queryFn: () => circleService.getMembers(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const sentInvitationsQuery = useQuery({
    queryKey: ['circle-invitations-sent', userId],
    queryFn: () => invitationService.getSentInvitations(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const receivedInvitationsQuery = useQuery({
    queryKey: ['circle-invitations-received', userEmail],
    queryFn: () => invitationService.getReceivedInvitations(userEmail!),
    enabled: !!userEmail,
    staleTime: STALE_TIME,
  });

  const members = membersQuery.data ?? [];
  const sentInvitations = sentInvitationsQuery.data ?? [];
  const receivedInvitations = receivedInvitationsQuery.data ?? [];

  const activeMembersCount = members.length;
  const sharedDataCount = useMemo(() => {
    return members.reduce((count, m) => {
      const perms = m.permissions;
      return count + (perms.realtimeStatus ? 1 : 0) + (perms.consumptionLevel ? 1 : 0) + (perms.locationOnAlert ? 1 : 0);
    }, 0);
  }, [members]);

  const addMemberMutation = useMutation({
    mutationFn: (data: {
      memberId: string;
      memberName: string;
      memberEmail: string;
      role?: CircleRole;
      permissions?: CirclePermissions;
    }) => circleService.addMember(userId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-members', userId] });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ memberId, permissions }: { memberId: string; permissions: CirclePermissions }) =>
      circleService.updatePermissions(memberId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-members', userId] });
    },
  });

  const revokeMemberMutation = useMutation({
    mutationFn: (memberId: string) => circleService.revokeMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-members', userId] });
    },
  });

  const sendInvitationMutation = useMutation({
    mutationFn: (data: { email: string; message?: string }) =>
      invitationService.createInvitation(userId!, data.email, userName, data.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-invitations-sent', userId] });
    },
  });

  const acceptInvitationMutation = useMutation({
    mutationFn: ({ invitationId, inviteeId }: { invitationId: string; inviteeId: string }) =>
      invitationService.acceptInvitation(invitationId, inviteeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-invitations-received', userEmail] });
    },
  });

  const declineInvitationMutation = useMutation({
    mutationFn: (invitationId: string) => invitationService.declineInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-invitations-received', userEmail] });
    },
  });

  const addMember = async (data: {
    memberId: string;
    memberName: string;
    memberEmail: string;
    role?: CircleRole;
    permissions?: CirclePermissions;
  }) => addMemberMutation.mutateAsync(data);

  const updatePermissions = async (memberId: string, permissions: CirclePermissions) =>
    updatePermissionsMutation.mutateAsync({ memberId, permissions });

  const revokeMember = async (memberId: string) => revokeMemberMutation.mutateAsync(memberId);

  const sendInvitation = async (email: string, message?: string) =>
    sendInvitationMutation.mutateAsync({ email, message });

  const acceptInvitation = async (invitationId: string) =>
    acceptInvitationMutation.mutateAsync({ invitationId, inviteeId: userId! });

  const declineInvitation = async (invitationId: string) =>
    declineInvitationMutation.mutateAsync(invitationId);

  const toggleSharing = useCallback(() => {
    setSharingEnabled(prev => !prev);
  }, []);

  return {
    members,
    sentInvitations,
    receivedInvitations,
    sharingEnabled,
    activeMembersCount,
    sharedDataCount,
    isLoading: membersQuery.isLoading || sentInvitationsQuery.isLoading,
    isError: membersQuery.isError,
    addMember,
    updatePermissions,
    revokeMember,
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    toggleSharing,
  };
};