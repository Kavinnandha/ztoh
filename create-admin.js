const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const existingAdmin = await Admin.findOne({ email: 'admin@ztoh.com' });
        if (existingAdmin) {
            console.log('Admin already exists:', existingAdmin);
            // Update password just in case
            existingAdmin.password = 'admin';
            await existingAdmin.save();
            console.log('Admin password updated to "admin"');
        } else {
            const newAdmin = await Admin.create({
                name: 'Admin',
                email: 'admin@ztoh.com',
                password: 'admin',
                role: 'superadmin'
            });
            console.log('Admin created:', newAdmin);
        }
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createAdmin();
