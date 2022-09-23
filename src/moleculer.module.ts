import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { Logger, Module, OnModuleInit } from "@nestjs/common";
import { Context, GenericObject, Loggers, ServiceBroker } from 'moleculer';
import { EventListenerProps } from './event-listener.decorator';
export { ServiceBroker } from 'moleculer';

const logger = new Logger('Moleculer')

class NestLogger extends Loggers.Base {
  getLogHandler(bindings: GenericObject) {
    return (type: string, args: any[]) => {
      switch (type) {
        case 'trace':
          return logger.log(`[${bindings.nodeID}] ` + args[0]);
        case 'debug':
          return logger.debug(`[${bindings.nodeID}] ` + args[0]);
        case 'info':
          return logger.log(`[${bindings.nodeID}] ` + args[0]);
        case 'warn':
          return logger.warn(`[${bindings.nodeID}] ` + args[0]);
        case 'error':
          return logger.error(`[${bindings.nodeID}] ` + args[0]);
        case 'fatal':
          return logger.error(`[${bindings.nodeID}] ` + args[0]);
        default:
          return logger.log(`[${bindings.nodeID}] ` + args[0]);
      }
    }
  }
}

@Module({
  imports: [DiscoveryModule],
  providers: [
    {
      provide: ServiceBroker,
      useValue: new ServiceBroker({
        logger: new NestLogger(),
        transporter: process.env.NATS_CONNECTION,
        disableBalancer: true
      })
    },
  ]
})
export class MoleculerModule implements OnModuleInit {
  constructor(private discoveryService: DiscoveryService, private broker: ServiceBroker) { }

  async onModuleInit() {
    const services = await this.discoveryService.providersWithMetaAtKey('service')

    services.map((service) => {
      const methods = Reflect.ownKeys(
        Object.getPrototypeOf(service.discoveredClass.instance)
      ).filter(method => method !== "constructor")

      const actions = {};
      for (const method of methods) {
        actions[method] = (ctx: Context) => {
          return service.discoveredClass.instance[method](ctx, this.broker)
        }
      }

      this.broker.createService({
        name: String(service.meta),
        actions
      });
    });

    const events = {};
    const listeners = await this.discoveryService.providersWithMetaAtKey('event-listener');

    listeners.map(listener => {
      const meta = listener.meta as EventListenerProps;
      const eventName = typeof meta === "string" ? meta : meta.event;

      this.broker.logger.debug(`Listener '${eventName}' (${listener.discoveredClass.name}) is registered.`);
      events[eventName] = {
        group: typeof meta === "string" ? undefined : meta.opts.group,
        handler: (ctx: Context) => {
          (listener.discoveredClass.instance as any).onMessage(ctx, this.broker);
        }
      }
    })

    this.broker.createService({
      name: `nest-event-listener-${String(Math.random()).replace('.', '').slice(0, 5)}`,
      events
    });

    await this.broker.start();
  }
}

