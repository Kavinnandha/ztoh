import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email, password } = await request.json();

        // Check if any admin exists, if not create a default one (for initial setup)
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            await Admin.create({
                name: 'Admin',
                email: 'admin@ztoh.com',
                password: 'admin', // In real app, hash this!
                role: 'superadmin'
            });
        }

        const admin = await Admin.findOne({ email });
        console.log('Login attempt for:', email);

        if (!admin) {
            console.log('Login failed: Admin not found');
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            console.log('Login failed: Invalid password');
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
