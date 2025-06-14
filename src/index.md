###
async function connectDB() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`);
    } catch(error) {
        console.log("ERROR:", error);
    }
}
connectDB(); // Call it

###
