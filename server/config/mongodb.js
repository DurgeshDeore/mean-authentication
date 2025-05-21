import mongoose from "mongoose";

const connectDB = async ()=> {
    // mongoose.connection.on('connected', ()=> console.log("DB connected !"));
    // await mongoose.connect(`${process.env.MONGODB_URL}`);
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected!");
    } catch (error) {
        console.error("DB connection failed:", error);
        process.exit(1); // Exit app on failure
    }
}

export default connectDB;   