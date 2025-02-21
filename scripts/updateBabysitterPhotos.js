const mongoose = require('mongoose');
const Babysitter = require('../Models/Babysitter');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const babysitterAvatars = [
  // Women avatars
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/women/5.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/women/7.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'https://randomuser.me/api/portraits/women/9.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
  'https://randomuser.me/api/portraits/women/11.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/women/13.jpg',
  'https://randomuser.me/api/portraits/women/14.jpg',
  'https://randomuser.me/api/portraits/women/15.jpg',
  // Add more avatars as needed
];

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function updatePhotos() {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error('MONGO_URL not found in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    const babysitters = await Babysitter.find({});
    const shuffledAvatars = shuffleArray([...babysitterAvatars]);
    
    for (let i = 0; i < babysitters.length; i++) {
      // Use modulo to cycle through avatars if we have more babysitters than avatars
      const avatarIndex = i % shuffledAvatars.length;
      const babysitter = babysitters[i];
      
      babysitter.photo = shuffledAvatars[avatarIndex];
      await babysitter.save();
      console.log(`Updated photo for ${babysitter.name} with ${shuffledAvatars[avatarIndex]}`);
    }

    console.log('All photos updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updatePhotos(); 