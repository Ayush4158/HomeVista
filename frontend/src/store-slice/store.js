import React from 'react'
import {configureStore} from "@reduxjs/toolkit"
import authSlice from './auth.slice'


const store = configureStore({
  reducer:{
    AuthReducer: authSlice,
  }
})

export default store
