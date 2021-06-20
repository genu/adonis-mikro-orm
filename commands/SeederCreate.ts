import { args } from '@adonisjs/core/build/standalone'
import BaseMikroOrmCommand from './BaseMikroOrmCommand'

export default class SeederCreate extends BaseMikroOrmCommand {
  public static commandName = 'seeder:create'
  public static description = 'Create a new seeder class'

  @args.string({
    required: true,
    description: 'Name of the seeder (Append "Seeder" to the name, e.g. DBSeeder)',
    name: 'DBSeeder',
  })
  public name: string

  public async run() {
    await this.orm.getSeeder().createSeeder(this.name)
  }
}
