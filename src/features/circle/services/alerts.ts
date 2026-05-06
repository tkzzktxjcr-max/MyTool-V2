import { account, createDocument, listDocuments, updateDocument, deleteDocument, Query, Permission, Role } from '@/lib/appwrite';
import { COLLECTIONS } from '@/lib/appwrite';
import type { CircleAlert, AlertSeverity, AlertType } from '../types';

interface AlertDoc {
  $id: string;
  userId: string;
  userName: string;
  alertType: string;
  severity: string;
  message: string;
  locationData?: string;
  isRead: boolean;
  $createdAt: string;
}

const mapDocToAlert = (doc: AlertDoc): CircleAlert => ({
  id: doc.$id,
  userId: doc.userId,
  userName: doc.userName,
  alertType: doc.alertType as AlertType,
  severity: doc.severity as AlertSeverity,
  message: doc.message,
  locationData: doc.locationData ? JSON.parse(doc.locationData) : undefined,
  isRead: doc.isRead,
  createdAt: doc.$createdAt,
});

export const alertService = {
  async createAlert(data: {
    userId: string;
    userName: string;
    alertType: AlertType;
    severity: AlertSeverity;
    message: string;
    locationData?: { lat: number; lng: number; timestamp: string };
  }): Promise<CircleAlert> {
    const currentUser = await account.get();
    if (currentUser.$id !== data.userId) throw new Error('Unauthorized');
    const doc = await createDocument(COLLECTIONS.CIRCLE_ALERTS, {
      userId: data.userId,
      userName: data.userName,
      alertType: data.alertType,
      severity: data.severity,
      message: data.message,
      locationData: data.locationData ? JSON.stringify(data.locationData) : null,
      isRead: false,
    }, [
      Permission.read(Role.user(data.userId)),
      Permission.update(Role.user(data.userId)),
      Permission.delete(Role.user(data.userId)),
    ]);
    return mapDocToAlert(doc as unknown as AlertDoc);
  },

  async getAlertsForUser(userId: string): Promise<CircleAlert[]> {
    const currentUser = await account.get();
    if (currentUser.$id !== userId) throw new Error('Unauthorized');
    const response = await listDocuments(COLLECTIONS.CIRCLE_ALERTS, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
    return (response.documents as unknown as AlertDoc[]).map(mapDocToAlert);
  },

  async getAlertsForRecipient(memberId: string): Promise<CircleAlert[]> {
    const currentUser = await account.get();
    if (currentUser.$id !== memberId) throw new Error('Unauthorized');
    const response = await listDocuments(COLLECTIONS.CIRCLE_ALERTS, [
      Query.equal('recipientIds', memberId),
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
    return (response.documents as unknown as AlertDoc[]).map(mapDocToAlert);
  },

  async markAsRead(alertId: string): Promise<void> {
    const currentUser = await account.get();
    const response = await listDocuments(COLLECTIONS.CIRCLE_ALERTS, [
      Query.equal('$id', alertId),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return;
    const doc = response.documents[0] as unknown as AlertDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');
    await updateDocument(COLLECTIONS.CIRCLE_ALERTS, alertId, { isRead: true });
  },

  async deleteOldAlerts(days: number = 30): Promise<void> {
    const currentUser = await account.get();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const response = await listDocuments(COLLECTIONS.CIRCLE_ALERTS, [
      Query.lessThan('$createdAt', cutoff.toISOString()),
    ]);
    for (const doc of response.documents) {
      const alert = doc as unknown as AlertDoc;
      if (alert.userId === currentUser.$id) {
        await deleteDocument(COLLECTIONS.CIRCLE_ALERTS, doc.$id);
      }
    }
  },

  async dismissAlert(alertId: string): Promise<void> {
    const currentUser = await account.get();
    const response = await listDocuments(COLLECTIONS.CIRCLE_ALERTS, [
      Query.equal('$id', alertId),
      Query.limit(1),
    ]);
    if (response.documents.length === 0) return;
    const doc = response.documents[0] as unknown as AlertDoc;
    if (doc.userId !== currentUser.$id) throw new Error('Unauthorized');
    await deleteDocument(COLLECTIONS.CIRCLE_ALERTS, alertId);
  },
};