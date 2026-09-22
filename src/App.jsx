import { StoreProvider } from './store.jsx'
import Layout from './components/Layout.jsx'

export default function App() {
  return (
    <StoreProvider>
      <Layout />
    </StoreProvider>
  )
}
