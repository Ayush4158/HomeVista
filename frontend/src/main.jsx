import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store-slice/store.js'
import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom'
import Registration from './components/Authentication/Registration.jsx'
import SignIn from './components/Authentication/SignIn.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '/register',
        element: <Registration/>
      },
      {
        path: '/Sign-in',
        element: <SignIn/>
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
    <App />
  </StrictMode>,
)
