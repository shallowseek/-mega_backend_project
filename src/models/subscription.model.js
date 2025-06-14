import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // Points to User who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // Points to User being subscribed to
        ref: "User"
    }
}, {timestamps: true})



// Sample subscription documents:
// {
//     _id: "sub1",
//     subscriber: "user123",  // John's ID
//     channel: "user456",     // TechChannel's ID  
//     createdAt: "2024-01-15T10:30:00Z",
//     updatedAt: "2024-01-15T10:30:00Z"
// }

// {
//     _id: "sub2", 
//     subscriber: "user123",  // John's ID
//     channel: "user789",     // CookingChannel's ID
//     createdAt: "2024-01-16T14:20:00Z", 
//     updatedAt: "2024-01-16T14:20:00Z"
// }
// Translation: John (user123) subscribed to TechChannel (user456) and CookingChannel (user789)


export const Subscription = mongoose.model("Subscription", subscriptionSchema)