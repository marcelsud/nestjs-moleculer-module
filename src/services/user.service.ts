import { Context, ServiceBroker } from 'moleculer';
import { Service } from '../service.decorator';

@Service('user')
export class UserService {
  getHello(ctx: Context, broker: ServiceBroker): string {
    console.log(ctx);
    console.log(broker.MOLECULER_VERSION)
    return 'Hello World!';
  }
}
