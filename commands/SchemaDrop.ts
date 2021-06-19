import { flags } from '@adonisjs/core/build/standalone'
import BaseMikroOrmCommand from './BaseMikroOrmCommand'

export default class SchemaDrop extends BaseMikroOrmCommand {
  public static commandName = 'schema:drop'
  public static description = 'Drop database schema based on current metadata'

  @flags.boolean({ alias: 'd', description: 'Dumps all queries to console' })
  public dump: boolean

  @flags.boolean({ description: 'Do not skip foreign key checks' })
  public fkChecks: boolean

  @flags.boolean({ description: 'Drop also migrations table' })
  public dropMigrationsTable: boolean

  @flags.boolean({ description: 'Drop the whole database' })
  public dropDb: boolean

  public async run() {
    await this.orm
      .getSchemaGenerator()
      .dropSchema({ dropDb: this.dropDb, dropMigrationsTable: this.dropMigrationsTable })
  }
}
