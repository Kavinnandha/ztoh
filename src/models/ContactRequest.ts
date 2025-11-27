import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactRequest extends Document {
    name: string;
    email: string;
    message: string;
    createdAt: Date;
}

const ContactRequestSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
}, {
    timestamps: true,
});

const ContactRequest: Model<IContactRequest> = mongoose.models.ContactRequest || mongoose.model<IContactRequest>('ContactRequest', ContactRequestSchema);

export default ContactRequest;
