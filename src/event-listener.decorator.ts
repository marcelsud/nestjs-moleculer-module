
import { applyDecorators, SetMetadata } from '@nestjs/common';

export type EventListenerProps = {
  event: string,
  opts?: {
    group?: string
  }
} | string

export function EventListener(props: EventListenerProps) {
  return applyDecorators(
    SetMetadata('event-listener', props),
  );
}
