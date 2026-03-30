import { RequestStatus } from '@prisma/client';

export class RequestStatusChangedEvent {
  constructor(
    public readonly requestId: string,
    public readonly oldStatus: RequestStatus,
    public readonly newStatus: RequestStatus,
    public readonly actorId: string,
  ) {}
}
