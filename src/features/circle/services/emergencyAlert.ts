import { account, createDocument, listDocuments, updateDocument, Query, Permission, Role } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { EmergencyAlert, LiveLocation } from '../types';

interface EmergencyAlertDoc {
  $id: string;
  userId: string;
  circleId: string;
  location?: string;
  isActive: boolean;
  resolvedAt?: string;
  $createdAt: string;
}

const mapDocToAlert = (doc: EmergencyAlertDoc): EmergencyAlert => ({
  id: doc.$id,
  userId: doc.userId,
  circleId: doc.circleId,
  location: doc.location ? JSON.parse(doc.location) : undefined,
  isActive: doc.isActive,
  resolvedAt: doc.resolvedAt,
  createdAt: doc.$createdAt,
});

export const emergencyAlertService = {
  async createAlert(data: {
    userId: string;
    circleId: string;
    location?: LiveLocation;
  }): Promise<EmergencyAlert> {
    const currentUser = await account.get();
    if (currentUser.$id !== data.userId) throw new Error('Unauthorized');

    const doc = await createDocument(
      COLLECTIONS.EMERGENCY_ALERTS,
      {
        userId: data.userId,
        circleId: data.circleId,
        location: data.location ? JSON.stringify(data.location) : null,
        isActive: true,
        resolvedAt: null,
      },
      [
        Permission.read(Role.users()),
        Permission.update(Role.user(data.userId)),
        Permission.delete(Role.user(data.userId)),
      ]
    );
    return mapDocToAlert(doc as unknown as EmergencyAlertDoc);
  },

  async getActiveAlertsForCircle(circleId: string): Promise<EmergencyAlert[]> {
    const response = await listDocuments(COLLECTIONS.EMERGENCY_ALERTS, [
      Query.equal('circleId', circleId),
      Query.equal('isActive', true),
      Query.orderDesc('$createdAt'),
    ]);
    return (response.documents as unknown as EmergencyAlertDoc[]).map(mapDocToAlert);
  },

  async resolveAlert(alertId: string): Promise<void> {
    const currentUser = await account.get();
    const res = await listDocuments(COLLECTIONS.EMERGENCY_ALERTS, [
      Query.equal('$id', alertId),
      Query.limit(1),
    ]);
    if (res.documents.length === 0) return;
    const doc = res.documents[0] as unknown as EmergencyAlertDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');
    await updateDocument(COLLECTIONS.EMERGENCY_ALERTS, alertId, {
      isActive: false,
      resolvedAt: new Date().toISOString(),
    });
  },
};