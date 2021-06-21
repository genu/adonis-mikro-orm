import { MikroORM } from '@mikro-orm/core'

/// <reference path="../adonis-typings/index.ts"/>

export abstract class BaseModel {
  public static $orm: MikroORM
}
