import { describe, it, expect } from 'vitest';
import { EventBus } from './event-bus';
import type { DomainEvent } from '@homework-tracker/shared-types';

function evt(id: string, type = 'progress.status.changed'): DomainEvent<{ n: number }> {
  return { eventId: id, eventType: type, timestamp: new Date().toISOString(), source: 'test', data: { n: 1 } };
}

describe('EventBus', () => {
  it('dispatches to subscribed handlers by type', async () => {
    const bus = new EventBus();
    let count = 0;
    bus.subscribe('progress.status.changed', () => {
      count += 1;
    });
    await bus.publish(evt('e1'));
    expect(count).toBe(1);
  });

  it('is idempotent: same eventId processed once', async () => {
    const bus = new EventBus();
    let count = 0;
    bus.subscribe('progress.status.changed', () => {
      count += 1;
    });
    await bus.publish(evt('dup'));
    await bus.publish(evt('dup'));
    await bus.publish(evt('dup'));
    expect(count).toBe(1);
    expect(bus.hasProcessed('dup')).toBe(true);
  });

  it('does not call handlers of other event types', async () => {
    const bus = new EventBus();
    let count = 0;
    bus.subscribe('assignment.changed', () => {
      count += 1;
    });
    await bus.publish(evt('e2', 'progress.status.changed'));
    expect(count).toBe(0);
  });

  it('unsubscribe stops delivery', async () => {
    const bus = new EventBus();
    let count = 0;
    const off = bus.subscribe('assignment.changed', () => {
      count += 1;
    });
    off();
    await bus.publish(evt('e3', 'assignment.changed'));
    expect(count).toBe(0);
  });
});
