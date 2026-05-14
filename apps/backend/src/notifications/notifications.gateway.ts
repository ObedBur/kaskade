import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  // ─── Connexion ─────────────────────────────────────────────────────────
  handleConnection(client: Socket) {
    const userId = client.handshake.auth?.userId as string;

    if (!userId) {
      this.logger.warn(`Client ${client.id} connecté sans userId — déconnexion.`);
      client.disconnect(true);
      return;
    }

    // Le client rejoint une room nommée par son userId
    // Cela permet d'envoyer des notifications ciblées
    client.join(userId);
    this.logger.log(`🔌 Client connecté: socketId=${client.id}, userId=${userId}`);
  }

  // ─── Déconnexion ───────────────────────────────────────────────────────
  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth?.userId as string;
    this.logger.log(`❌ Client déconnecté: socketId=${client.id}, userId=${userId || 'inconnu'}`);
  }

  // ─── Envoi ciblé vers un utilisateur ───────────────────────────────────
  sendToUser(userId: string, notification: any) {
    this.server.to(userId).emit('notification', notification);
    this.logger.log(`📨 Notification envoyée en temps réel à userId=${userId}: ${notification.title} (${notification.type})`);
  }

  // ─── Envoi vers plusieurs utilisateurs ─────────────────────────────────
  sendToUsers(userIds: string[], notification: any) {
    for (const userId of userIds) {
      this.server.to(userId).emit('notification', notification);
    }
    this.logger.log(`📨 Notification envoyée en temps réel à ${userIds.length} utilisateurs: ${notification.title} (${notification.type})`);
  }
}
