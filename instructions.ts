import { join } from 'path'
import { mkdirSync, existsSync } from 'fs'
import * as sinkStatic from '@adonisjs/sink'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * Prompt choices for the database server selection
 */
const DB_SERVER_PROMPT_CHOICES = [
  {
    name: 'mariadb' as const,
    message: 'MariaDB',
  },
  {
    name: 'mysql' as const,
    message: 'MySQL',
  },
  {
    name: 'postgres' as const,
    message: 'PostgreSQL',
  },
  {
    name: 'sqlite' as const,
    message: 'SQLite',
  },
  {
    name: 'sqlite' as const,
    message: 'SQLite',
  },
]

/**
 * Environment variables used by different database
 * drivers
 */
const DB_SERVER_ENV_VALUES = {
  default: {
    DATABASE_URI: 'postgresql://postgres@127.0.0.1:5432/mikro-db',
  },
  sqlite: {},
}

/**
 * Packages required by different drivers
 */
const DB_DRIVER_PACKAGES = {
  sqlite: '@mikro-orm/sqlite',
  mysql: '@mikro-orm/mysql',
  postgres: '@mikro-orm/postgresql',
  mongo: '@mikro-orm/mongodb',
  maria: '@mikro-orm/mariadb',
}

/**
 * Prompts user for the drivers they want to use
 */
function getDbDrivers(sink: typeof sinkStatic) {
  return sink
    .getPrompt()
    .choice('Select the database driver you want to use', DB_SERVER_PROMPT_CHOICES, {
      validate(choices) {
        return choices && choices.length ? true : 'Select at least one database driver to continue'
      },
    })
}

/**
 * Returns absolute path to the stub relative from the templates
 * directory
 */
function getStub(...relativePaths: string[]) {
  return join(__dirname, 'templates', ...relativePaths)
}

/**
 * Instructions to be executed when setting up the package.
 */
export default async function instructions(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic
) {
  const driver = await getDbDrivers(sink)

  /**
   * Create database config
   */
  const configPath = app.configPath('database.ts')
  const databaseConfig = new sink.files.MustacheFile(
    projectRoot,
    configPath,
    getStub('database.txt')
  )

  databaseConfig.overwrite = true
  databaseConfig
    .apply({
      sqlite: driver.includes('sqlite'),
      mysql: driver.includes('mysql'),
      oracle: driver.includes('mariadb'),
      postgres: driver.includes('postgres'),
    })
    .commit()
  const configDir = app.directoriesMap.get('config') || 'config'
  sink.logger.action('create').succeeded(`${configDir}/database.ts`)

  /**
   * Create default seeder
   */

  const defaultSeederPath = app.databasePath('seeders', 'db.seeder.ts')
  const defaultSeeder = new sink.files.MustacheFile(
    projectRoot,
    defaultSeederPath,
    getStub('seeder.txt')
  )
  defaultSeeder.overwrite = true
  defaultSeeder.commit()
  const defaultSeederDir = app.directoriesMap.get('database') || 'database'
  sink.logger.action('create').succeeded(`${defaultSeederDir}/seeder/db.seeder.ts`)

  /**
   * Setup .env file
   */
  const env = new sink.files.EnvFile(projectRoot)

  /**
   * Unset old values
   */
  if (!driver.includes('sqlite')) {
    Object.keys(DB_SERVER_ENV_VALUES['default']).forEach((key) => {
      env.unset(key)
    })

    Object.keys(DB_SERVER_ENV_VALUES['default']).forEach((key) => {
      env.set(key, DB_SERVER_ENV_VALUES['default'][key])
    })
  }

  env.commit()
  sink.logger.action('update').succeeded('.env,.env.example')

  /**
   * Create tmp dir when sqlite is selected
   */
  if (driver.includes('sqlite') && !existsSync(app.tmpPath())) {
    mkdirSync(app.tmpPath())
    const tmpDir = app.directoriesMap.get('tmp') || 'tmp'
    sink.logger.action('create').succeeded(`./${tmpDir}`)
  }

  /**
   * Install required dependencies
   */
  const pkg = new sink.files.PackageJsonFile(projectRoot)

  /**
   * Remove existing dependencies
   */
  Object.keys(DB_DRIVER_PACKAGES).forEach((driverPkg) => {
    if (!driverPkg.includes(driver as any)) {
      pkg.uninstall(DB_DRIVER_PACKAGES[driver], false)
    }
  })

  pkg.install('luxon', undefined, false)
  pkg.install(DB_DRIVER_PACKAGES[driver], undefined, false)

  const logLines = [
    `Installing: ${sink.logger.colors.gray(pkg.getInstalls(false).list.join(', '))}`,
  ]

  /**
   * Find the list of packages we have to remove
   */
  const packagesToRemove = pkg
    .getUninstalls(false)
    .list.filter((name) => pkg.get(`dependencies.${name}`))

  if (packagesToRemove.length) {
    logLines.push(`Removing: ${sink.logger.colors.gray(packagesToRemove.join(', '))}`)
  }

  const spinner = sink.logger.await(logLines.join(' '))

  try {
    await pkg.commitAsync()
    spinner.update('Packages installed')
  } catch (error) {
    spinner.update('Unable to install packages')
    sink.logger.fatal(error)
  }

  spinner.stop()
}
