import { createBrowserRouter, Navigate } from "react-router-dom"
import { Landing } from "./pages/Landing"
import { DocsLayout } from "./pages/docs/DocsLayout"
import { DocsPage } from "./pages/docs/DocsPage"

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  {
    path: "/docs",
    element: <DocsLayout />,
    children: [
      { index: true, element: <Navigate to="/docs/introduction" replace /> },
      { path: "*", element: <DocsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])
