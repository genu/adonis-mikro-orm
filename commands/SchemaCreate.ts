import { args, flags } from '@adonisjs/core/build/standalone'
import BaseMikroOrmCommand from './BaseMikroOrmCommand'

export default class SchemaCreate extends BaseMikroOrmCommand {
  public static commandName = 'schema:create'
  public static description = 'Create database schema based on current metadata'

  @flags.boolean({ alias: 'd', description: 'Dumps all queries to console' })
  public dump: boolean

  @flags.boolean({ description: 'Do not skip foreign key checks' })
  public fkChecks: boolean

  @args.string({
    required: false,
    description: 'Allows to seed the database on create or drop and recreate',
  })
  public seed: string

  public async run() {
    await this.orm.getSchemaGenerator().createSchema()
  }
}
