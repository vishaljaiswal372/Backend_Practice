import mongoose from 'mongoose';

const connectDB=async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed")
    }
}

export default connectDB;