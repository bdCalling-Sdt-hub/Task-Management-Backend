const mongoose = require("mongoose");
require("dotenv").config();
const { Service, User, Interest } = require("../models");
const interests = require("../db/interest.json");

// Sample data
const usersData = [
  {
    fullName: "Testing Admin",
    email: "admin@gmail.com",
    phoneNumber: "01735566789",
    password: "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO",
    role: "admin",
    isEmailVerified: true,
  },
  {
    fullName: "Testing Employee",
    email: "employee@gmail.com",
    phoneNumber: "01735566789",
    password: "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO",
    role: "employee",
    isEmailVerified: true,
    referralCode:"TEST12"
  },
  {
    fullName: "Testing Client",
    email: "client@gmail.com",
    phoneNumber: "01734456873",
    password: "$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO",
    role: "client",
    isEmailVerified: true,
    referralCode:"TEST13"

  },
];


const serviceData = [
  {
    id: 1,
    name: "Organic Social Media Advertising",
    type: "socialMedia",
    description: [
      "GET ORGANIC LIKES",
      "GET ORGANIC FOLLOWERS",
      "GET ORGANIC COMMENTS",
      "GET ORGANIC VIEWS",
      "GET ORGANIC SHARING TO STORY",
    ],
    Categories: [
      {
        id: 1,
        name: "Facebook",
        service: [
          {
            name: "Request Likes",
            price: 0.60,
            sobTitle: "Per Like",
            min: 10,
            max: 10000,
          },
          {
            name: "Request Followers",
            price: 1.0,
            sobTitle: "Per Follower",
            min: 10,
            max: 10000,
          },
          {
            name: "Request Comments",
            price: 0.8,
            sobTitle: "Per Comment",
            min: 5,
            max: 100,
          },
          {
            name: "Request Views",
            price: 0.5,
            sobTitle: "Per View",
            min: 10,
            max: 10000,
          },
          {
            name: "Request sharing to story",
            price: 0.9,
            sobTitle: "Per Story",
            min: 5,
            max: 100,
          },
        ],
      },
      {
        id: 2,
        name: "Instagram",
        service: [
          {
            name: "Request Likes",
            price: 0.6,
            sobTitle: "Per Like",
            min: 10,
            max: 10000,
          },
          {
            name: "Request Followers",
            price: 1.0,
            sobTitle: "Per Follower",
            min: 10,
            max: 10000,
          },
          {
            name: "Request Comments",
            price: 0.8,
            sobTitle: "Per Comment",
            min: 5,
            max: 100,
          },
          {
            name: "Request Views",
            price: 0.5,
            sobTitle: "Per View",
            min: 10,
            max: 10000,
          },
          {
            name: "Request sharing to story",
            price: 0.9,
            sobTitle: "Per Story",
            min: 5,
            max: 100,
          },
        ],
      },
      {
        id: 3,
        name: "Tiktok",
        service: [
          {
            name: "Request Likes",
            price: 0.5,
            sobTitle: "Per Like",
            min: 10,
            max: 10000,
          },
          {
            name: "Request Followers",
            price: 1.10,
            sobTitle: "Per Follower",
            min: 10,
            max: 10000,
          },
          {
            name: "Request Comments",
            price: 0.90,
            sobTitle: "Per Comment",
            min: 5,
            max: 100,
          },
          {
            name: "Request Views",
            price: 0.4,
            sobTitle: "Per View",
            min: 10,
            max: 10000,
          },
          {
            name: "Request sharing to story",
            price: 0.7,
            sobTitle: "Per Story",
            min: 5,
            max: 100,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Organic Video Promotions",
    type: "video",
    description: [
      "GET ORGANIC VIEWS",
      "GET ORGANIC LIKES",
      "GET ORGANIC COMMENTS",
      "GET ORGANIC SUBSCRIBERS",
    ],
    Categories: [
      {
        id: 1,
        name: "Youtube",
        service: [
          {
            name: "Request Views",
            price: 0.8,
            sobTitle: "Per View",
            min: 10,
            max: 2000,
          },
          {
            name: "Request Likes",
            price: 1.0,
            sobTitle: "Per Like",
            min: 10,
            max: 1000,
          },
          {
            name: "Request Comments",
            price: 1.0,
            sobTitle: "Per Comment",
            min: 5,
            max: 100,
          },
          {
            name: "Request Subscriber",
            price: 2.0,
            sobTitle: "Per Subscriber",
            min: 10,
            max: 2000,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Business Offerings",
    type: "corporate",
    description: [
      "SIGN UP TO SERVICES",
      "APP DOWNLOADS",
      "GAME DOWNLOADS",
      "GET ORGANIC VIDEO STREAMS",
      "GET ORGANIC MUSIC STREAMS",
    ],
    Categories: [
      {
        id: 1,
        name: "Corporate",
        service: [
          {
            name: "Surveys ",
            price: 9.0,
            sobTitle: "Per Survey",
            min: 10,
            max: 500,
          },
          {
            name: "Sing up",
            price: 10.0,
            sobTitle: "Per Sign up",
            min: 10,
            max: 1000,
          },
          {
            name: "App Downloads",
            price: 10.0,
            sobTitle: "Per Download",
            min: 10,
            max: 1000,
          },
          {
            name: "Game Downloads",
            price: 0.6,
            sobTitle: "Per Download",
            min: 10,
            max: 1000,
          },
          {
            name: "Request Streaming(Music)",
            price: 0.6,
            sobTitle: "Per Stream",
            min: 10,
            max: 10000,
          },
          {
            name: "Request Streaming (Series, Movies, Shows)",
            price: 4.00,
            sobTitle: "Per Stream",
            min: 10,
            max: 10000,
          },
        ],
      },
    ],
  },
];



// Function to drop the entire database
const dropDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log("------------> Database dropped successfully! <------------");
  } catch (err) {
    console.error("Error dropping database:", err);
  }
};

// Function to seed users
const seedUsers = async () => {
  try {
    await User.deleteMany();
    await User.insertMany(usersData);
    console.log("Users seeded successfully!");
  } catch (err) {
    console.error("Error seeding users:", err);
  }
};

const seedSubscriptions = async () => {
  try {
    await Service.deleteMany();
    await Service.insertMany(serviceData);
    console.log("Services seeded successfully!");
  } catch (err) {
    console.error("Error seeding Services:", err);
  }
};
const seedInterest = async () => {
  try {
    await Interest.deleteMany();
    await Interest.insertMany(interests);
    console.log("Interests seeded successfully!");
  } catch (err) {
    console.error("Error seeding Interests:", err);
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL);

// Call seeding functions
const seedDatabase = async () => {
  try {
    await dropDatabase();
    await seedUsers();
    await seedSubscriptions();
    await seedInterest();
    console.log("--------------> Database seeding completed <--------------");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    mongoose.disconnect();
  }
};

// Execute seeding
seedDatabase();
