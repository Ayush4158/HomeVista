import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../utils/Input'
import Button from '../../utils/Button'

const SignIn = () => {
  const [isSignIn , setIsSignIn] = useState()
  const navigate = useNavigate()

  const {register, handleSubmit} = useForm();

  const onSubmit = async (data) => {
    setIsSignIn(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, {
      email: data.email,
      password: data.password,
      }, {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });
      alert(response.data.message)
      navigate('/')
    } catch (error) {
      console.log("Error while sign in ", error)
    } finally{
      setIsSignIn(false)
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      {/* Some texts */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6"> Join Mystery Message </h1>
        <p className="mb-4"> Sign up to start your anonymous adventure </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <div className="space-y-5">
          <Input
            label="Email: "
            placeholder="Enter your Email"
            {...register("email", { required: true })}
          />
          <Input
            label="Password: "
            placeholder="Enter your password"
            type="password"
            {...register("password", { required: true })}
          />
          <Button type="submit" className="w-full" disabled={isSignIn}>
            {isSignIn ? 'Creating Account...' : 'Create Account'}
          </Button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p>
          Dont Have Account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            Sign in
          </Link> 
        </p>
      </div>
    </div>
  </div>
  )
}

export default SignIn
