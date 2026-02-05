import mongoose from 'mongoose';
import { Schema } from 'mongoose';
const ObjectId=Schema.Types.ObjectId;

const subscriptionSchema=new Schema({
    subscriber:{
        type:ObjectId,
        ref:"user",
    },
    channel:{
        type:ObjectId,
        ref:"user",
    },
}); // {a,cwc} {b,ht} {c,ht} {c,cwc}

const SubscriptionModel=mongoose.model("subscription",subscriptionSchema);

export default SubscriptionModel;