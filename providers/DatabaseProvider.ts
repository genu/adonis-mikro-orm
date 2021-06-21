import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { MikroORM } from '@mikro-orm/core'

export default class DatabaseServiceProvider {
  constructor(protected app: ApplicationContract) {}

  public static needsApplication = true

  private registerOrm() {
    this.app.container.singleton('adonis-mikro-orm', async () => {
      const config = this.app.container.resolveBinding('Adonis/Core/Config').get('database', {})
      const { BaseModel } = require('../src/BaseModel')

      BaseModel.$orm = await MikroORM.init(config)
    })
  }

  public register(): void {
    this.registerOrm()
  }
}

export { BaseModel } from '../src/BaseModel'
