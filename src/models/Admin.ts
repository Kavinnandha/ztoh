import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
    name: string;
    email: string;
    password?: string; // Optional if using OAuth later, but required for credentials
    role: 'superadmin' | 'admin' | 'editor';
    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'admin', 'editor'], default: 'admin' },
}, {
    timestamps: true,
});

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
