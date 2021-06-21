import { MikroORM } from '@mikro-orm/core'

export class BaseModel {
  public static $orm: MikroORM
}
