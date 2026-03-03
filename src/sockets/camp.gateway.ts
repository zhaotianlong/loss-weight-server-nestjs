import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CampGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('CampGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinCamp')
  handleJoinCamp(client: Socket, campId: string) {
    client.join(`camp:${campId}`);
    return { event: 'joined', data: campId };
  }

  notifyCampUpdate(campId: string, payload: any) {
    this.server.to(`camp:${campId}`).emit('campUpdate', payload);
  }

  broadcastNotification(message: string) {
    this.server.emit('notification', { message, timestamp: new Date() });
  }
}
