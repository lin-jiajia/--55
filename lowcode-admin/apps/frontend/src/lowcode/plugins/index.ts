import { App } from 'vue'

const modules = import.meta.glob('./*.vue')

export function registerLowcodePlugins(app: App) {
  Object.entries(modules).forEach(([path, loader]) => {
    const name = path.split('/').pop()!.replace(/\.vue$/, '')
    // @ts-ignore dynamic
    loader().then((mod: any) => {
      app.component(name, mod.default || mod)
    })
  })
}