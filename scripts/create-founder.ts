// scripts/create-founder.ts
import { connect } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee-shop';

async function createFounder() {
  try {
    // Connect to MongoDB
    await connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = (await connect(MONGODB_URI)).connection.db;
    const usersCollection = db!.collection('users');

    // Check if founder already exists
    const founderExists = await usersCollection.findOne({ role: 'founder' });
    if (founderExists) {
      console.log('Founder already exists!');
      process.exit(0);
    }

    // Create founder account
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('AmirrezaBaghian2004', salt);

    const founder = {
      firstName: 'Amirreza',
      lastName: 'Baghian',
      email: 'Amirrezabaghian@gmail.com',
      password: hashedPassword,
      role: 'founder',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.insertOne(founder);
    console.log('Founder account created successfully!');
    console.log('Email: founder@coffeeshop.com');
    console.log('Password: AmirrezaBaghian2004');

    process.exit(0);
  } catch (error) {
    console.error('Error creating founder:', error);
    process.exit(1);
  }
}

createFounder().catch((error) => {
  console.error('Script has not to be run!:', error);
  process.exit(1);
});
