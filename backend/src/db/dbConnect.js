import mongoose from "mongoose";

const connectTODB = async () => {
  try {
    const connectionInstatnce = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`\n MongoDb Connected !! DB Host: ${connectionInstatnce.connection.host}`)
  } catch (error) {
    console.log("MongoDb connection failed: ", error)
    process.exit(1)
  }
}

export default connectTODB