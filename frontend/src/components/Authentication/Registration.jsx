import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form"
import axios from "axios"
import Input from '../../utils/Input';
import Button from '../../utils/Button';

const Registration = () => {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const {register, handleSubmit} = useForm();
  const onSubmit = async(data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullname", data.fullname);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("avatar", data.avatar[0]); 

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // console.log(response.data)

      alert(response.data.message);

      navigate('/');
    } catch (error) {
      console.error("Error in registration ", error);
    } finally{
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">

        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6"> Join Mystery Message </h1>
          <p className="mb-4"> Sign up to start your anonymous adventure </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <div className="space-y-5">
            <Input
              label="Fullname: "
              placeholder="Enter your fullname"
              {...register("fullname", { required: true })}
            />
            <Input
              label="Username: "
              placeholder="Enter your username"
              {...register("username", { required: true })}
            />
            <Input
              label="Email: "
              placeholder="Enter your Email"
              {...register("email", { required: true })}
            />
            <div>
              <label className="block mb-2">Avatar:</label>
              <input
                type="file"
                accept="image/*"
                {...register("avatar", { required: true })}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <Input
              label="Password: "
              placeholder="Enter your password"
              type="password"
              {...register("password", { required: true })}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>


        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link to="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link> 
          </p>
        </div>
      </div>
    </div>
  )
}

export default Registration;
