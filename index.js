require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const Joi = require('joi');
const haversine = require('haversine');

// Express setup
const app = express();
app.use(express.json());

// Environment variables
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  throw new Error('MONGO_URI and JWT_SECRET must be defined');
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('open', () => console.log('🚀 MongoDB connected successfully.'));
mongoose.connection.on('error', (err) => console.error('❌ MongoDB connection error:', err));

// MongoDB models
const User = mongoose.model('User', new mongoose.Schema({
  publicKey: String,
  userType: { type: String, enum: ['Driver', 'Rider'] },
  name: String,
  contact: String,
  password: String,
}));

const Ride = mongoose.model('Ride', new mongoose.Schema({
  rideId: String,
  rider: String,
  driver: String,
  fare: Number,
  status: String,
  pickup: { lat: Number, lng: Number },
  drop: { lat: Number, lng: Number },
}));

// Solana connection
const connection = new Connection(clusterApiUrl('devnet'));

// Solana event listener
const rideAccountPublicKey = new PublicKey('5afHBWc6iEDdL8c3BFXLSXDTJPaoAbg75WyVq7gEz5xG'); // Update with your ride account's public key
connection.onAccountChange(rideAccountPublicKey, async (accountInfo, context) => {
  try {
    console.log('📡 Solana account change detected!');

    const updatedStatus = 'Accepted'; // This would be dynamically decoded
    await Ride.findOneAndUpdate(
      { rideId: rideAccountPublicKey.toString() },
      { status: updatedStatus }
    );

    console.log('✅ Ride status updated in MongoDB to:', updatedStatus);
  } catch (error) {
    console.error('❌ Error updating MongoDB:', error);
  }
});

// Solana log listener
const programId = new PublicKey('EGTrQLm8E1rNZB1Y9ABPjmLAAWNHv2kdLevjponj7T16'); // Your deployed program ID
console.log('Program ID:', programId.toString());

connection.onLogs(
  programId,
  (logs, context) => {
    console.log('📜 Solana Log:', logs.logs);
    if (logs.err) {
      console.error('❌ Transaction error:', logs.err);
    } else {
      console.log('✅ Transaction logs received successfully.');
    }
  },
  'all'
);

// Calculate distance using Haversine formula
function calculateDistance(pickup, drop) {
  const start = { latitude: pickup.lat, longitude: pickup.lng };
  const end = { latitude: drop.lat, longitude: drop.lng };
  return haversine(start, end); // Distance in kilometers
}

// Matching process for riders and drivers
async function matchRiderWithDriver() {
  const availableDriver = await User.findOne({ userType: 'Driver' });
  if (!availableDriver) throw new Error('No available driver found');
  return availableDriver;
}

// Routes
app.post('/register', async (req, res) => {
  const { name, contact, userType, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, contact, userType, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/create-ride', async (req, res) => {
  const { rider, pickup, drop } = req.body;

  // Calculate distance
  const distance = calculateDistance(pickup, drop);

  // Calculate fare (minimum fare ₹50 + ₹15 per km)
  const fare = Math.max(50, 15 * distance);

  // Find a driver
  const driver = await matchRiderWithDriver();

  // Create and save the ride
  const newRide = new Ride({
    rideId: `RIDE_${Date.now()}`,
    rider,
    driver: driver.publicKey,
    fare,
    status: 'Requested',
    pickup,
    drop,
  });
  await newRide.save();

  res.status(201).json({ message: 'Ride created successfully', ride: newRide });
});

app.post('/cancel-ride', async (req, res) => {
  const { rideId, cancelledBy } = req.body;

  const ride = await Ride.findOne({ rideId });
  if (!ride) return res.status(404).json({ message: 'Ride not found' });

  if (ride.status === 'Completed') {
    return res.status(400).json({ message: 'Ride is already completed and cannot be cancelled' });
  }

  try {
    const byRider = cancelledBy === 'rider';
    await cancelRideOnSolana(rideId, byRider);

    ride.status = 'Cancelled';
    await ride.save();

    res.status(200).json({
      message: `Ride cancelled successfully by ${cancelledBy}`,
      ride,
    });
  } catch (error) {
    console.error('Error cancelling the ride:', error);
    res.status(500).json({ message: 'Failed to cancel the ride' });
  }
});

// Mock Solana transaction logic for cancellation
async function cancelRideOnSolana(rideId, byRider) {
  console.log(`Simulating cancellation on Solana for Ride ID: ${rideId}, By Rider: ${byRider}`);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Root route to handle GET /
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Ride Sharing Backend!');
});
