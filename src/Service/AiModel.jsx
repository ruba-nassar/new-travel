import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

export const chatSession = model.startChat({
  generationConfig,
  history: [
    {
      role: "user",
      parts: [
        {text: "Create an optimal trip itinerary based on the specified location, duration, budget, and number of persons. Generate Travel Plan for Location: {Bhopal} for startDate: {12/11/2024} and endDate:{12/27/2024} with no of People or group: {4-5} with Budget: {Luxury}; give me list of hotels with hotel name, description, address, rating, price, location in map, coordinates, image url; also for the same create the itinerary for {4-5} days, suggest places, give name, details, pricing, timings, place images urls, location (coordinate or in map); Remember all have to cover in the {Luxury} level budget. Important: give the result in JSON Format"},
        
      ],
    },
    {
      role: "model",
      parts: [
                 {text: "```json\n{\n  \"tripDetails\": {\n    \"location\": \"Bhopal\",\n    \"startDate\": \"2024-12-11\",\n    \"endDate\": \"2024-12-27\",\n    \"duration\": \"16 days\",\n     \"groupSize\": \"4-5\",\n    \"budgetLevel\": \"Luxury\"\n  },\n    \"hotels\": [\n      {\n          \"hotelName\": \"Jehan Numa Palace Hotel\",\n          \"description\": \"A heritage hotel, the Jehan Numa Palace is known for its majestic architecture, impeccable service, and lush green surroundings. It offers a blend of old-world charm and modern amenities.\",\n          \"address\": \"157, Shamla Hills, Bhopal, Madhya Pradesh 462013\",\n          \"rating\": 4.6,\n           \"price\": \"₹12,000 - ₹25,000 per night\",\n          \"location\": \"https://maps.app.goo.gl/14oFkQv7aB7rYV3T7\",\n          \"coordinates\": {\n              \"latitude\": 23.2478,\n              \"longitude\": 77.3779\n          },\n          \"imageUrl\": \"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/e5/63/22/jehan-numa-palace-bhopal.jpg?w=700&h=-1&s=1\"\n      },\n       {\n            \"hotelName\": \"Noor-Us-Sabah Palace\",\n            \"description\": \"Another heritage property, Noor-Us-Sabah Palace offers a regal experience with its opulent interiors, sprawling gardens, and panoramic views of the Upper Lake.\",\n             \"address\": \"VIP Rd, Kohe Fiza, Bhopal, Madhya Pradesh 462001\",\n            \"rating\": 4.4,\n             \"price\": \"₹10,000 - ₹20,000 per night\",\n              \"location\": \"https://maps.app.goo.gl/d3f6H3bM3c3z9mYm9\",\n            \"coordinates\": {\n                 \"latitude\": 23.2606,\n                \"longitude\": 77.3908\n            },\n             \"imageUrl\": \"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/e7/5e/b4/noor-us-sabah-palace.jpg?w=700&h=-1&s=1\"\n        },\n      {\n        \"hotelName\": \"Courtyard by Marriott Bhopal\",\n        \"description\": \"A modern, upscale hotel offering comfortable rooms, excellent dining options, and a range of amenities for a pleasant stay.\",\n        \"address\": \"DB City, Arera Hills, Bhopal, Madhya Pradesh 462011\",\n        \"rating\": 4.3,\n        \"price\": \"₹8,000 - ₹15,000 per night\",\n        \"location\": \"https://maps.app.goo.gl/c9gX343e4jX8K7wM8\",\n        \"coordinates\": {\n          \"latitude\": 23.2312,\n           \"longitude\": 77.4133\n          },\n        \"imageUrl\": \"https://media-cdn.tripadvisor.com/media/photo-s/13/90/9a/13/courtyard-bhopal.jpg\"\n      }\n  ],\n  \"itinerary\": {\n        \"duration\": \"4 Days\",\n        \"days\": [\n      {\n        \"day\": 1,\n        \"theme\": \"Historical Exploration\",\n        \"places\": [\n          {\n            \"name\": \"Bhojpur Temple\",\n            \"details\": \"An unfinished Hindu temple housing a massive Shiva Lingam. A masterpiece of 11th-century architecture.\",\n            \"pricing\": \"Free entry\",\n            \"timings\": \"7:00 AM - 7:00 PM\",\n            \"imageUrl\": \"https://upload.wikimedia.org/wikipedia/commons/b/bc/Bhojpur_Temple_Bhopal.jpg\",\n            \"location\": \"https://maps.app.goo.gl/q9T9K22fE5vD1z3b8\" ,\n            \"coordinates\":{\n                  \"latitude\": 23.0782,\n                  \"longitude\": 77.6299\n            }\n          },\n          {\n             \"name\": \"Sanchi Stupa\",\n            \"details\": \"A UNESCO World Heritage Site, Sanchi Stupa is one of the oldest stone structures in India. Witness the stupas and monasteries of the Buddhist era.\",\n            \"pricing\": \"₹60 for Indians, ₹800 for foreigners\",\n            \"timings\": \"8:30 AM - 5:30 PM\",\n           \"imageUrl\": \"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Sanchi_Stupa.jpg/1200px-Sanchi_Stupa.jpg\",\n           \"location\": \"https://maps.app.goo.gl/iH15j9v4g646jTz87\",\n             \"coordinates\":{\n                  \"latitude\": 23.4828,\n                  \"longitude\": 77.7442\n            }\n          }\n        ],\n        \"activities\": [\n           \"Private luxury car transport to and from Sanchi. \",\n          \"Guided tour of the Stupa complex by a professional historian.\"\n        ]\n      },\n      {\n        \"day\": 2,\n        \"theme\": \"Lakes and City Exploration\",\n        \"places\": [\n            {\n              \"name\": \"Upper Lake (Bada Talab)\",\n              \"details\": \"One of the largest artificial lakes in India. Enjoy a serene boat ride or a leisurely walk along the promenade.\",\n               \"pricing\": \"Boat ride ₹200-₹500\",\n              \"timings\": \"Open 24 hours; boat rides are available throughout the day\",\n               \"imageUrl\": \"https://upload.wikimedia.org/wikipedia/commons/1/1a/Upper_Lake_Bhopal.jpg\",\n               \"location\": \"https://maps.app.goo.gl/38bXGk7d2G4QWJ8r9\",\n               \"coordinates\":{\n                  \"latitude\": 23.2565,\n                  \"longitude\": 77.3660\n               }\n            },\n           {\n              \"name\": \"Taj-ul-Masajid\",\n              \"details\": \"One of the largest mosques in Asia, known for its impressive architecture.\",\n             \"pricing\": \"Free entry\",\n             \"timings\": \"Open 24 hours; visiting time outside prayer hours is advised.\",\n             \"imageUrl\": \"https://upload.wikimedia.org/wikipedia/commons/d/d4/Taj-ul-masajid.jpg\",\n              \"location\": \"https://maps.app.goo.gl/Z9b95f9e5Hq5mUqK8\",\n               \"coordinates\":{\n                    \"latitude\":23.2578,\n                  \"longitude\": 77.4139\n            }\n           },\n            {\n                \"name\": \"State Museum of Madhya Pradesh\",\n                 \"details\":\"Showcases the rich history and culture of Madhya Pradesh, with diverse artifacts and exhibits.\",\n                 \"pricing\": \"₹20 per person\",\n                 \"timings\": \"10:00 AM to 6:00 PM (Closed on Mondays)\",\n                 \"imageUrl\":\"https://www.indianholiday.com/images/museum-madhya-pradesh-bhopal-558981313.jpg\",\n                 \"location\": \"https://maps.app.goo.gl/p24T93z5yqB6b3zZ7\",\n                 \"coordinates\": {\n                     \"latitude\":23.2360,\n                     \"longitude\": 77.4106\n                 }\n            }\n        ],\n        \"activities\": [\n          \"Luxury yacht ride on the Upper Lake at sunset with high tea and snacks.\",\n          \"Personalized guided tour of Taj-ul-Masajid by a local expert.\",\n          \"Private shopping at local markets for authentic handicrafts.\"\n        ]\n      },\n      {\n        \"day\": 3,\n         \"theme\":\"Art and Nature\",\n         \"places\": [\n              {\n                 \"name\": \"Bharat Bhawan\",\n                \"details\":\"A multi-arts complex featuring museums, art galleries, a library, and an open-air theater.\",\n               \"pricing\": \"₹50 per person\",\n                \"timings\": \"2:00 PM - 8:00 PM (Closed on Mondays)\",\n               \"imageUrl\":\"https://www.holidify.com/images/cmsuploads/compressed/4823_20200204195805.jpg\",\n                \"location\":\"https://maps.app.goo.gl/1mXk3Yw899fQ2Y1N8\",\n                \"coordinates\": {\n                   \"latitude\":23.2400,\n                  \"longitude\": 77.3928\n                }\n             },\n             {\n                 \"name\":\"Van Vihar National Park\",\n                \"details\":\" A national park housing various species of animals and birds in their natural habitats. Ideal for wildlife enthusiasts and nature lovers.\",\n                \"pricing\":\"₹20 per person\",\n                \"timings\":\" 7:00 AM - 7:00 PM (Closed on Fridays)\",\n                \"imageUrl\":\"https://bhopal.nic.in/wp-content/uploads/2023/06/Van-vihar.jpg\",\n                \"location\":\"https://maps.app.goo.gl/r7k2XGjW9aQjJ7rA9\",\n                 \"coordinates\":{\n                    \"latitude\":23.2509,\n                    \"longitude\": 77.3989\n                }\n             }\n         ],\n        \"activities\":[\n            \"Curated art tour of Bharat Bhawan with an art curator.\",\n            \"Private guided tour of Van Vihar National Park.\",\n            \"Picnic lunch arranged within a serene spot in the park.\"\n        ]\n      },\n        {\n           \"day\": 4,\n            \"theme\": \"Relaxation and Departure\",\n            \"places\": [\n                {\n                    \"name\": \"Kerwa Dam\",\n                    \"details\": \"A scenic spot offering beautiful views and a peaceful environment for a relaxing morning.\",\n                    \"pricing\":\"Free\",\n                    \"timings\":\"Open 24 hours\",\n                    \"imageUrl\":\"https://www.holidify.com/images/cmsuploads/compressed/2920_20180215121232.jpg\",\n                    \"location\":\"https://maps.app.goo.gl/jB7v1c8XyqNn287e6\",\n                     \"coordinates\":{\n                       \"latitude\":23.2192,\n                       \"longitude\":77.3055\n                     }\n                }\n            ],\n           \"activities\":[\n               \"Private yoga and meditation session by the lake.\",\n               \"Luxurious spa treatments at the hotel.\",\n               \"Personalized Farewell Lunch at a fine-dining restaurant before departure.\"\n           ]\n        }\n    ]\n  }\n}\n```"},

      ],
    },
  ],
});
