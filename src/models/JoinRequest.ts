import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJoinRequest extends Document {
    type: 'student' | 'teacher';
    // Common fields
    email: string;
    name: string;
    gender: string;
    mobile: string;
    address: string;

    // Student specific
    applyingAs?: string;
    currentStatus?: string;
    gradeYear?: string;
    boardUniversity?: string;
    subjectDetails?: string;
    modeOfStudy?: string;
    specificNeeds?: string;

    // Teacher specific
    qualification?: string;
    nationality?: string;
    state?: string;
    city?: string;
    currentJobDetails?: string;
    experience?: string;
    subjectWillingToHandle?: string;
    modeOfTutoring?: string;
    workType?: string;

    createdAt: Date;
}

const JoinRequestSchema: Schema = new Schema({
    type: { type: String, required: true, enum: ['student', 'teacher'] },
    email: { type: String, required: true },
    name: { type: String, required: true },
    gender: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },

    // Student
    applyingAs: { type: String },
    currentStatus: { type: String },
    gradeYear: { type: String },
    boardUniversity: { type: String },
    subjectDetails: { type: String },
    modeOfStudy: { type: String },
    specificNeeds: { type: String },

    // Teacher
    qualification: { type: String },
    nationality: { type: String },
    state: { type: String },
    city: { type: String },
    currentJobDetails: { type: String },
    experience: { type: String },
    subjectWillingToHandle: { type: String },
    modeOfTutoring: { type: String },
    workType: { type: String },
}, {
    timestamps: true,
});

const JoinRequest: Model<IJoinRequest> = mongoose.models.JoinRequest || mongoose.model<IJoinRequest>('JoinRequest', JoinRequestSchema);

export default JoinRequest;
