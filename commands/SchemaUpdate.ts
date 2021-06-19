import BaseMikroOrmCommand from './BaseMikroOrmCommand'

export default class SchemaUpdate extends BaseMikroOrmCommand {
  public static commandName = 'schema:update'
  public static description = 'Update database schema based on current metadata'

  public async run() {
    await this.orm.getSchemaGenerator().updateSchema()
  }
}
