const axios = require('axios');
const { MongoClient } = require('mongodb');


// Replace with your MongoDB connection string
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

// API endpoint
const apiUrl = 'https://script.google.com/macros/s/AKfycbyAuBaaJw2CqqTNIfluhhrlDBRGEI5l1ClRYj_4_ZDZYTl7kdjsje_7ud4S-ec2LxAqEQ/exec'; // Replace with your actual API

async function fetchDataAndUpdate() {
  try {
    // Step 1: Fetch data from the API
    const response = await axios.get(apiUrl);
    let data = response.data;

    // Step 2: Ensure the data is in an array format
    if (!Array.isArray(data)) {
      if (data.hasOwnProperty('data') && Array.isArray(data.data)) {
        data = data.data; // Use the nested array if necessary
      } else {
        data = [data]; // Wrap single objects in an array
      }
    }

    // Step 3: Connect to MongoDB
    await client.connect();
    const database = client.db('weatherData'); // Database name
    const collection = database.collection('weatherRecords'); // Collection name

    // Step 4: Loop through each item in the data and update the database
    for (let item of data) {
      // Assuming each item has a unique 'id' field
      const filter = { id: item.id }; // Match document by unique id field
      const update = { $set: item }; // Update the document with new data

      // Step 5: Use updateOne() with upsert: true
      await collection.updateOne(filter, update, { upsert: true });
    }

    console.log('Data successfully updated in MongoDB!');
  } catch (error) {
    console.error('Error fetching data or updating MongoDB:', error);
  } finally {
    // Step 6: Close the MongoDB connection
    await client.close();
  }
}

fetchDataAndUpdate();
