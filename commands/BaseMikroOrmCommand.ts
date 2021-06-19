import { BaseCommand } from '@adonisjs/core/build/standalone'
import { MikroORM, Options } from '@mikro-orm/core'

export default abstract class BaseMikroOrmCommand extends BaseCommand {
  protected dbConfig: Options
  protected orm: MikroORM

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async prepare() {
    this.dbConfig = this.application.config.get('database')

    this.orm = await MikroORM.init(this.dbConfig)
  }
}
