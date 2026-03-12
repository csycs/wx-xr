import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './app.scss'

const App = createApp({
  onLaunch(options) {
    console.log('App Launch', options)
  },
  onShow(options) {
    console.log('App Show', options)
  },
  onHide() {
    console.log('App Hide')
  }
})

const pinia = createPinia()
App.use(pinia)

export default App
