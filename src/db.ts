import mongoose, { connect } from 'mongoose';

const connectDB = async (URI: string) => {
    try {
        await connect(URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
        console.log('MongoDB Connected');
    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
};

export default connectDB;
