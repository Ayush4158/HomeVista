import dotenv from "dotenv";
import {app} from './app.js'
import connectTODB from "./db/dbConnect.js";

dotenv.config({
  path: '../.env'
})

connectTODB()
.then(() => {
  app.on("error", (error) => {
    console.log("Error: ", error)
    throw error
  })
  app.listen(process.env.PORT || 7777, () => {
    console.log(`Server is ready on http://localhost:${process.env.PORT}`)
  })
})
.catch((error) => {
  console.log("Mongo DB connection failed !! ", error)
})



// app.get("/" , (req,res) => {
//   res.send("all ok")
// })
// app.listen(process.env.PORT, () => {
//   console.log("server ready")
// })