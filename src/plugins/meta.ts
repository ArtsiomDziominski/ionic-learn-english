import { useHead, HeadObject } from '@vueuse/head'
import { App } from 'vue'

export default {
    install(app: App) {
        app.config.globalProperties.$setMeta = (metaInfo: HeadObject) => {
            useHead(metaInfo)
        }
    }
}