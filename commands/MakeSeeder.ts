import { BaseCommand, args } from '@adonisjs/core/build/standalone'

export default class MakeSeeder extends BaseCommand {
  public static commandName = 'make:seeder'
  public static description = 'Make a new Seeder file'

  @args.string({ description: 'Name of the seeder class' })
  public name: string

  public async run(): Promise<void> {
    console.log('running seeder')
  }
}
