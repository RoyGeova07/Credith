import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'

const pages = {
  '/': <LoginPage />,
  '/login': <LoginPage />,
  '/register': <RegisterPage />,
}

export default function App() {
  const path = window.location.pathname.toLowerCase()

  return pages[path] ?? <LoginPage />
}
