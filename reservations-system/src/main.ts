import { createApp } from 'vue'
import App from './App.vue'
import './styles.css'

// Import vee-validate configuration
import './validation/config'

// Import components
import { ErrorMessage, Field, Form } from 'vee-validate'

const app = createApp(App)

// Register components globally
app.component('FieldInput', Field)
app.component('FormWrapper', Form)
app.component('ErrorMessage', ErrorMessage)

app.mount('#app')
