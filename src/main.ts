import { Logger, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SomethingHappenedListener } from './listeners/something-happened.listener';
import { MoleculerModule } from './moleculer.module';
import { UserService } from './services/user.service';

@Module({
  imports: [MoleculerModule],
  providers: [UserService, SomethingHappenedListener]
})
export class AppModule { }

async function main() {
  const app = await NestFactory.create(AppModule);

  const port = Math.floor(
    Math.random() * (4000 - 3000 + 1) + 3000
  )
  await app.listen(port, () => {
    Logger.log(`Listening on port ${port}`)
  });
}

main();


