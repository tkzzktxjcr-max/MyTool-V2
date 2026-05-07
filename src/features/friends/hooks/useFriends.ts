import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context';
import { useAlcohol } from '@/features/alcohol/hooks';
import { friendsService } from '../services/friends';
import type { Friend, FriendRequest } from '../types';

const STALE_TIME = 2 * 60 * 1000;

export const useFriends = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.$id;
  const userName = user?.name;
  const userEmail = user?.email;

  const { insights, getWeeklyUnits } = useAlcohol();

  // ── Queries ──────────────────────────────────────────────────────────
  const friendsQuery = useQuery({
    queryKey: ['friends', userId],
    queryFn: () => friendsService.getFriends(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  const receivedRequestsQuery = useQuery({
    queryKey: ['friend-requests-received', userEmail],
    queryFn: () => friendsService.getReceivedRequests(userEmail!),
    enabled: !!userEmail,
    staleTime: STALE_TIME,
  });

  const sentRequestsQuery = useQuery({
    queryKey: ['friend-requests-sent', userId],
    queryFn: () => friendsService.getSentRequests(userId!),
    enabled: !!userId,
    staleTime: STALE_TIME,
  });

  // Sync accepted invitations on mount
  useEffect(() => {
    if (!userId || !userName || !userEmail) return;
    friendsService.syncAcceptedInvitations(userId, userName, userEmail).then(() => {
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
    }).catch(() => {});
  }, [userId, userName, userEmail, queryClient]);

  // Auto-update my summary when page loads
  useEffect(() => {
    if (!userId) return;
    const weeklyUnits = getWeeklyUnits();
    const streak = insights?.streak || 0;
    const soberDays = insights?.dailyTrend?.filter(d => d.units === 0).length || 0;
    friendsService.updateMySummary(userId, { weeklyUnits, soberDays, streak }).catch(() => {});
  }, [userId, insights, getWeeklyUnits]);

  // ── Derived data ─────────────────────────────────────────────────────
  const friends = friendsQuery.data ?? [];
  const receivedRequests = receivedRequestsQuery.data ?? [];
  const sentRequests = sentRequestsQuery.data ?? [];

  // ── Mutations ─────────────────────────────────────────────────────────
  const sendRequestMutation = useMutation({
    mutationFn: (email: string) => friendsService.sendRequest(userId!, userName || '', userEmail || '', email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests-sent', userId] });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: ({ requestId, inviteeName }: { requestId: string; inviteeName: string }) =>
      friendsService.acceptRequest(requestId, userId!, inviteeName, userEmail!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests-received', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
    },
  });

  const declineRequestMutation = useMutation({
    mutationFn: (requestId: string) => friendsService.declineRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests-received', userEmail] });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: (friendId: string) => friendsService.removeFriend(userId!, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
    },
  });

  const updateSummaryMutation = useMutation({
    mutationFn: (summary: { weeklyUnits: number; soberDays: number; streak: number }) =>
      friendsService.updateMySummary(userId!, summary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', userId] });
    },
  });

  // ── Wrapper functions ─────────────────────────────────────────────────
  const sendRequest = async (email: string) => sendRequestMutation.mutateAsync(email);
  const acceptRequest = async (requestId: string, inviteeName: string) => acceptRequestMutation.mutateAsync({ requestId, inviteeName });
  const declineRequest = async (requestId: string) => declineRequestMutation.mutateAsync(requestId);
  const removeFriend = async (friendId: string) => removeFriendMutation.mutateAsync(friendId);
  const updateSummary = async (summary: { weeklyUnits: number; soberDays: number; streak: number }) => updateSummaryMutation.mutateAsync(summary);

  const isLoading = friendsQuery.isLoading || receivedRequestsQuery.isLoading;

  return {
    friends,
    receivedRequests,
    sentRequests,
    isLoading,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    updateSummary,
  };
};