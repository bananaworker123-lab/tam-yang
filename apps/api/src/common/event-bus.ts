import { Injectable, Logger } from '@nestjs/common';
import type { DomainEvent } from '@homework-tracker/shared-types';

type Handler = (event: DomainEvent<unknown>) => void | Promise<void>;

/**
 * Minimal in-process domain event bus (Modular Monolith).
 *
 * - `publish` dispatches to all handlers subscribed to the event type.
 * - Delivery is idempotent: an event whose `eventId` was already processed
 *   is ignored, so handlers can safely assume at-most-once effect even if the
 *   same event is published twice (e.g. retries).
 */
@Injectable()
export class EventBus {
  private readonly logger = new Logger(EventBus.name);
  private readonly handlers = new Map<string, Set<Handler>>();
  private readonly processed = new Set<string>();

  subscribe(eventType: string, handler: Handler): () => void {
    const set = this.handlers.get(eventType) ?? new Set<Handler>();
    set.add(handler);
    this.handlers.set(eventType, set);
    return () => set.delete(handler);
  }

  async publish(event: DomainEvent<unknown>): Promise<void> {
    if (this.processed.has(event.eventId)) {
      this.logger.debug(`Skipping duplicate event ${event.eventId}`);
      return;
    }
    this.processed.add(event.eventId);
    const set = this.handlers.get(event.eventType);
    if (!set) return;
    for (const handler of set) {
      await handler(event);
    }
  }

  /** Test/util helper. */
  hasProcessed(eventId: string): boolean {
    return this.processed.has(eventId);
  }
}
