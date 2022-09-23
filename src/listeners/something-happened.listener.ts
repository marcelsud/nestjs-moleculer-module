import { Context, ServiceBroker } from 'moleculer';
import { EventListener } from '../event-listener.decorator';

@EventListener({
  event: 'something.happened',
  opts: {
    group: 'something'
  }
})
export class SomethingHappenedListener {
  onMessage(ctx: Context, broker: ServiceBroker) {
    broker.logger.info('something.happened');
  }
}
