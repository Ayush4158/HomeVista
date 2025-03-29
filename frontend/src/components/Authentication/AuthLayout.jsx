import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthLayout = ({children}) => {

  const navigate = useNavigate()
  const [loader, setLoader] = useState(true)
  let authStatus = localStorage.getItem("isLogin")

  const navigationFunction = () => {
    if(authStatus === 'true'){
      return
    }else{
      alert('login to view other features')
      navigate('/login')
    }
  }

  useEffect(() => {
    navigationFunction()
    setLoader(false)
  }, [authStatus, navigate])
  return loader ? <h1>Loading...</h1> : <>{children}</>
}

export default AuthLayout
