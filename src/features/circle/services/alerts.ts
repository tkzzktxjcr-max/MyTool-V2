import { createDocument, listDocuments, updateDocument, deleteDocument, Query } from '@/lib/appwrite';
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
    const doc: AlertDoc = await createDocument(COLLECTIONS.CIRCLE_ALERTS, {
      userId: data.userId,
      userName: data.userName,
      alertType: data.alertType,
      severity: data.severity,
      message: data.message,
      locationData: data.locationData ? JSON.stringify(data.locationData) : null,
      isRead: false,
    }) as AlertDoc;
    return mapDocToAlert(doc);
  },

  async getAlertsForUser(userId: string): Promise<CircleAlert[]> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_ALERTS, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
    return (response.documents as AlertDoc[]).map(mapDocToAlert);
  },

  async getAlertsForRecipient(memberId: string): Promise<CircleAlert[]> {
    const response = await listDocuments(COLLECTIONS.CIRCLE_ALERTS, [
      Query.equal('recipientIds', memberId),
      Query.orderDesc('$createdAt'),
      Query.limit(50),
    ]);
    return (response.documents as AlertDoc[]).map(mapDocToAlert);
  },

  async markAsRead(alertId: string): Promise<void> {
    await updateDocument(COLLECTIONS.CIRCLE_ALERTS, alertId, { isRead: true });
  },

  async deleteOldAlerts(days: number = 30): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const response = await listDocuments(COLLECTIONS.CIRCLE_ALERTS, [
      Query.lessThan('$createdAt', cutoff.toISOString()),
    ]);
    for (const doc of response.documents) {
      await deleteDocument(COLLECTIONS.CIRCLE_ALERTS, doc.$id);
    }
  },

  async dismissAlert(alertId: string): Promise<void> {
    await deleteDocument(COLLECTIONS.CIRCLE_ALERTS, alertId);
  },
};