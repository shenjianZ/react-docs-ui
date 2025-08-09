import { Navigate, Route, Routes } from "react-router-dom"

import { ThemeProvider } from "@/components/theme-provider"
import { DocsPage } from "@/pages/DocsPage"
import { HomePage } from "@/pages/HomePage"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:lang" element={<DocsPage />} />
        <Route path="/:lang/*" element={<DocsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
