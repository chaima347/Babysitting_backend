
const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';
let parentToken, babysitterToken, babysitterId, reservationId;

async function testAuth() {
  try {
  
    const parentRegister = await axios.post(`${BASE_URL}/auth/signup`, {
      name: "Test Parent",
      email: "testparent@test.com",
      password: "test123",
      role: "Parent"
    });
    console.log('Parent Registration:', parentRegister.status === 201 ? 'Success ✅' : 'Failed ❌');

   
    const babysitterRegister = await axios.post(`${BASE_URL}/auth/signup`, {
      name: "Test Babysitter",
      email: "testbabysitter@test.com",
      password: "test123",
      role: "Babysitter"
    });
    console.log('Babysitter Registration:', babysitterRegister.status === 201 ? 'Success ✅' : 'Failed ❌');


    const parentLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: "testparent@test.com",
      password: "test123"
    });
    parentToken = parentLogin.data.token;
    console.log('Parent Login:', parentToken ? 'Success ✅' : 'Failed ❌');

    const babysitterLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: "testbabysitter@test.com",
      password: "test123"
    });
    babysitterToken = babysitterLogin.data.token;
    console.log('Babysitter Login:', babysitterToken ? 'Success ✅' : 'Failed ❌');

  } catch (error) {
    console.error('Auth Test Error:', error.response?.data || error.message);
  }
}

async function testBabysitterProfile() {
  try {
    
    const createProfile = await axios.post(`${BASE_URL}/babysitters`, {
      bio: "Experienced babysitter with 5 years of experience",
      experience: 5,
      hourlyRate: 25,
      location: {
        type: "Point",
        coordinates: [-73.935242, 40.730610],
        address: "123 Test St, New York, NY"
      },
      availability: [
        {
          day: "Monday",
          startTime: "09:00",
          endTime: "17:00"
        }
      ],
      skills: ["First Aid", "CPR Certified"]
    }, {
      headers: { Authorization: `Bearer ${babysitterToken}` }
    });
    
    babysitterId = createProfile.data._id;
    console.log('Create Babysitter Profile:', babysitterId ? 'Success ✅' : 'Failed ❌');

    
    const getBabysitters = await axios.get(`${BASE_URL}/babysitters`);
    console.log('Get Babysitters:', getBabysitters.data.length > 0 ? 'Success ✅' : 'Failed ❌');

  } catch (error) {
    console.error('Babysitter Profile Test Error:', error.response?.data || error.message);
  }
}


async function testReservations() {
  try {
    
    const createReservation = await axios.post(`${BASE_URL}/reservations`, {
      babysitterId: babysitterId,
      startTime: new Date(Date.now() + 86400000), // Tomorrow
      endTime: new Date(Date.now() + 86400000 + 18000000), // Tomorrow + 5 hours
      location: {
        address: "456 Parent St, New York, NY",
        coordinates: [-73.935242, 40.730610]
      },
      numberOfChildren: 2,
      childrenAges: [4, 6],
      specialInstructions: "Allergic to peanuts"
    }, {
      headers: { Authorization: `Bearer ${parentToken}` }
    });

    reservationId = createReservation.data._id;
    console.log('Create Reservation:', reservationId ? 'Success ✅' : 'Failed ❌');

    
    const updateStatus = await axios.patch(
      `${BASE_URL}/reservations/${reservationId}/status`,
      { status: 'accepted' },
      { headers: { Authorization: `Bearer ${babysitterToken}` } }
    );
    console.log('Update Reservation Status:', updateStatus.status === 200 ? 'Success ✅' : 'Failed ❌');

  } catch (error) {
    console.error('Reservation Test Error:', error.response?.data || error.message);
  }
}

async function testReviews() {
  try {
    
    const createReview = await axios.post(`${BASE_URL}/reviews`, {
      reservationId: reservationId,
      rating: 5,
      comment: "Excellent service, very professional!"
    }, {
      headers: { Authorization: `Bearer ${parentToken}` }
    });

    const reviewId = createReview.data._id;
    console.log('Create Review:', reviewId ? 'Success ✅' : 'Failed ❌');

    const getReviews = await axios.get(`${BASE_URL}/reviews/babysitter/${babysitterId}`);
    console.log('Get Reviews:', getReviews.data.reviews.length > 0 ? 'Success ✅' : 'Failed ❌');

  } catch (error) {
    console.error('Review Test Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  console.log('📝 Testing Authentication...');
  await testAuth();
  console.log('\n');

  console.log('👤 Testing Babysitter Profile...');
  await testBabysitterProfile();
  console.log('\n');

  console.log('📅 Testing Reservations...');
  await testReservations();
  console.log('\n');

  console.log('⭐ Testing Reviews...');
  await testReviews();
  console.log('\n');

  console.log('✨ Tests Completed!');
}

runTests();