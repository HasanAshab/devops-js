import fs from 'node:fs'
import path from 'node:path'
import { ApplicationService } from '@adonisjs/core/types'
import type { RouteGroup } from '@adonisjs/core/http'
import { importDefault } from '#app/helpers'
import { log } from 'node:console'



export default class RouteProvider {
  constructor(protected app: ApplicationService) {}

  private async extendRoute() {
    const { Router } = await import('@adonisjs/core/http')

    Router.macro(
      'discover',
      async function (
        this: InstanceType<typeof Router>,
        base: string,
        cb: (group: RouteGroup) => any
      ) {
        const stack = [base]
        while (stack.length > 0) {
          const currentPath = stack.pop()
          if (!currentPath) break
          const items = fs.readdirSync(currentPath)
          for (const item of items) {
            
            const itemPath = path.join(currentPath, item).replaceAll('\\', '/')
            const status = fs.statSync(itemPath)

            if (status.isFile()) {
              const itemPathEndpoint = itemPath
                .replace(base, '')
                .split('.')[0]
                .replace('index', '')
                .toLowerCase()
               
              const routerPath = '#' + itemPath.split('.')[0]
              const createRoutes = await importDefault(routerPath)
              if (typeof createRoutes !== 'function') continue
              const group = this.group(() => {
                this.group(createRoutes).prefix(itemPathEndpoint)
              })
              cb(group)
            } else if (status.isDirectory()) {
              stack.push(itemPath)
            }
          }
        }
      }
    )
  }

  async boot() {
    await this.extendRoute()
  }
}
