// URL of the endpoint to send the request to
const url = "https://b2b-solution-public-api.bsscommerce.com/api/v1/pl/get-by-id";

// Data to be sent in the request body
const data = { 
  "domain": "92157f.myshopify.com", 
  "accessKey": "AhWwCkg6wBV+wykIGUgoO/PlT1mOB91KSpat2RMSc10=" ,
  "id": 188613
};

// Options for the fetch request
const options = {
  method: 'POST', // HTTP method
  headers: {
    'Content-Type': 'application/json' // Header indicating the content type
  },
  body: JSON.stringify(data) // Convert the data object to a JSON string
};

// Send the fetch request
fetch(url, options)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json(); // Parse the JSON from the response
  })
  .then(responseData => {
    console.log('Success:', JSON.stringify(responseData)); // Handle the response data
  })
  .catch(error => {
    console.error('Error:', error); // Handle any errors
  });
