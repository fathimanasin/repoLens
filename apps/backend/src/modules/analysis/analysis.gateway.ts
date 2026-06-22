import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@WebSocketGateway({
  cors: {
    origin:
      process.env.FRONTEND_URL ||
      'http://localhost:5173',
    credentials: true,
  },
  namespace: '/analysis',
})
export class AnalysisGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(
    AnalysisGateway.name,
  );

  private redisSubscriber:
    ReturnType<typeof createClient> | null =
      null;

  constructor(
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log(
      'Analysis WebSocket Gateway initialized',
    );

    void this.startRedisSubscriber();
  }

  handleConnection(client: Socket) {
    this.logger.log(
      `Client connected: ${client.id}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected: ${client.id}`,
    );
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody()
    data: {
      repositoryId: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const room =
      `analysis:${data.repositoryId}`;

    client.join(room);

    this.logger.log(
      `Client ${client.id} subscribed to ${room}`,
    );

    return {
      event: 'subscribed',
      data: {
        repositoryId: data.repositoryId,
      },
    };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody()
    data: {
      repositoryId: string;
    },

    @ConnectedSocket()
    client: Socket,
  ) {
    const room =
      `analysis:${data.repositoryId}`;

    client.leave(room);

    this.logger.log(
      `Client ${client.id} unsubscribed to ${room}`,
    );

    return {
      event: 'unsubscribed',
      data: {
        repositoryId: data.repositoryId,
      },
    };
  }

  private async startRedisSubscriber(): Promise<void> {
    const redisUrl =
      this.configService.get<string>(
        'REDIS_URL',
        'redis://redis:6379',
      );

    this.redisSubscriber = createClient({
      url: redisUrl,
    });

    this.redisSubscriber.on(
      'error',
      (err: unknown) => {
        this.logger.error(
          'Redis subscriber error:',
          err,
        );
      },
    );

    await this.redisSubscriber.connect();

    await this.redisSubscriber.pSubscribe(
      'analysis:progress:*',
      (
        message: string,
        channel: string,
      ) => {
        try {
          const payload =
            JSON.parse(message);

          const repositoryId =
            payload.repositoryId;

          if (!repositoryId) {
            return;
          }

          const room =
            `analysis:${repositoryId}`;

          this.server
            .to(room)
            .emit(
              'progress',
              payload,
            );

          this.logger.log(
            `Progress emitted to room ${room}: ${payload.stage} ${payload.percent}%`,
          );
        } catch (err) {
          this.logger.error(
            'Failed to parse progress message:',
            err,
          );
        }
      },
    );

    this.logger.log(
      'Redis subscriber started — listening on analysis:progress:*',
    );
  }
}