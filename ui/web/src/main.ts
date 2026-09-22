import type { ChargingStationData, ConfigurationData, UIServerConfigurationSection } from '@/types'

import App from '@/App.vue'
import { getFromLocalStorage, setToLocalStorage, UIClient } from '@/composables'
import { router } from '@/router'
import { type App as AppType, type Component, createApp, ref } from 'vue'
import ToastPlugin from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-bootstrap.css'

const app = createApp(App as Component)

const initializeApp = (app: AppType, config: ConfigurationData) => {
  app.config.errorHandler = (error, instance, info) => {
    console.error('Error:', error)
    console.info('Vue instance:', instance)
    console.info('Error info:', info)
  }
  if (!Array.isArray(config.uiServer)) {
    config.uiServer = [config.uiServer]
  }
  app.config.globalProperties.$configuration ??= ref<ConfigurationData>(config)
  if (!Array.isArray(app.config.globalProperties.$templates?.value)) {
    app.config.globalProperties.$templates = ref<string[]>([])
  }
  if (!Array.isArray(app.config.globalProperties.$chargingStations?.value)) {
    app.config.globalProperties.$chargingStations = ref<ChargingStationData[]>([])
  }
  if (
    getFromLocalStorage<number | undefined>('uiServerConfigurationIndex', undefined) == null ||
    getFromLocalStorage<number>('uiServerConfigurationIndex', 0) >
      (app.config.globalProperties.$configuration.value.uiServer as UIServerConfigurationSection[])
        .length -
        1
  ) {
    setToLocalStorage<number>('uiServerConfigurationIndex', 0)
  }
  app.config.globalProperties.$uiClient ??= UIClient.getInstance(
    (app.config.globalProperties.$configuration.value.uiServer as UIServerConfigurationSection[])[
      getFromLocalStorage<number>('uiServerConfigurationIndex', 0)
    ]
  )
  app.use(router).use(ToastPlugin).mount('#app')
}

// Fallback only. The real configuration is served at /config.json and is
// bind-mounted into the container, so it can change without a rebuild.
// NOTE: `secure: true` matters - the UI is served over HTTPS and a browser
// refuses to open an insecure ws:// socket from an HTTPS page.
const fallbackConfig = {
  uiServer: {
    authentication: {
      enabled: false,
      password: 'admin',
      type: 'protocol-basic-auth',
      username: 'admin',
    },
    host: globalThis.location.hostname.replace(/^e-simulator\./, 'e-simulator-api.'),
    port: 443,
    protocol: 'ui',
    secure: true,
    version: '0.0.1',
  },
}

fetch('/config.json')
  .then(response => {
    if (!response.ok) {
      console.error('Failed to fetch app configuration, using fallback')
      initializeApp(app, fallbackConfig as unknown as ConfigurationData)
      return undefined
    }
    return response.json()
  })
  .then(config => {
    if (config != null) {
      initializeApp(app, config as ConfigurationData)
    }
    return undefined
  })
  .catch((error: unknown) => {
    console.error('Error fetching app configuration, using fallback:', error)
    try {
      initializeApp(app, fallbackConfig as unknown as ConfigurationData)
    } catch (initError: unknown) {
      console.error('Error initializing app:', initError)
    }
  })
