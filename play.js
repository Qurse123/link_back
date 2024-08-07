const url = "https://api.apollo.io/v1/people/match";

const data = {
    "first_name": "Tim",
    "last_name": "Zheng",
    "organization_name": "Apollo",
    "email": "name@domain.io",
    "hashed_email": "8d935115b9ff4489f2d1f9249503cadf",
    "domain": "apollo.io",
    "linkedin_url": "http://www.linkedin.com/in/tim-zheng-677ba010",
    "reveal_personal_emails": true,
};

const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'X-Api-Key': 'f12iJsQoejoZFrDh7wnn4w'
};

fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => {
    // Log the email from the request (as returned in the response)
    console.log("Email from request:", result.person.email);

    // Check for personal emails
    const personalEmails = result.person.personal_emails;
    if (personalEmails && personalEmails.length > 0) {
        console.log("Revealed personal email:", personalEmails[0]);
    } else {
        console.log("No personal emails revealed");
    }

    // Log all phone numbers
    const phoneNumbers = result.person.phone_numbers;
    if (phoneNumbers && phoneNumbers.length > 0) {
        console.log("Phone numbers:");
        phoneNumbers.forEach(phone => {
            console.log(`${phone.type}: ${phone.sanitized_number}`);
        });
    } else {
        console.log("No phone numbers revealed");
    }
})
.catch(error => console.error('Error:', error));