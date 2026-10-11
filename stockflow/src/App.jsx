import { useEffect, useState } from 'react'
import { StoreProvider } from './store.jsx'
import Layout from './components/Layout.jsx'
import ShopLayout from './components/ShopLayout.jsx'

function Router() {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const admin = path === '/admin' || path.startsWith('/admin/')
  return admin ? <Layout /> : <ShopLayout />
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  )
}
