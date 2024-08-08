# CS 493 Cloud Application Development

Developed and integrated RESTful API into a Docker container that was deployed to the Google Cloud Platform.

## Assignment Info

### Purpose 
This assignment is designed to get you familiar with Docker. You will learn to make a
Docker image and deploy it to the Google Cloud Platform.

### Instructions
Take any one of assignments 3, 4 or 5, wrap it up in a Docker image and deploy it to Google Compute
Engine using a container.
1. The Docker image should contain everything required to deploy your application.
2. The Docker container should start and run the server automatically.
3. It should be possible to POST a boat and GET a boat from your application.


### Application 
- Your application must support the following 2 endpoints
    - POST /boats
        - Request must be JSON and must allow specifying the name property.
            - It is up to you if the request requires other properties and if the request imposes any
constraints on the input. Specify that in your document.
        - Response must be JSON and include the ID of the boat as the property id .
            - It is up to you if the response includes other properties.
            - But the response must include the id so that we can use it to test GET.
    - GET /boats/:id
        - Response must be JSON.
        - Response must include the id and name .
            - It is up to you if the response includes other attributes.
- The focus of the assignment is on Docker, so the format of the requests and responses is not
critical.
    - There is no requirement to do input validation, constraint checking, etc.
    - I suggest use something that worked for you in one of the previous assignments.
- There is no authentication or authorization for the endpoints in this assignment.

- It is OK if your application has additional endpoints beyond the two that are required (e.g., because
of the assignment you choose to deploy on Docker). That's OK, we will not be testing any of those
endpoints

### Datastore for the Project
- Make sure that your project has a Datastore database created for use.

- If you created a Google App Engine project, Datastore database is automatically created and you
should not create a Datastore database yourself.

- If you don't want to create a Google App Engine project, then to create a Datastore database for
your GCP project, from the GCP menu, go to Datastore -> Dashbaord
    - "Select Datastore Mode"
    - Choose a location, e.g., the US, and
    - Click "Create Database."

### Credential File
- In order for your app to access Cloud Datastore, you need to create a service account and then
export the key as a JSON file.
    - You can read about creating and managing service account keys here
(https://cloud.google.com/iam/docs/creating-managing-service-account-keys#iam-serviceaccount-keys-create-console) .
    - Grant the role "Cloud Datastore User" to the service account.
    - On the service account, click on the "Keys" tabs, then "Add Key", then "Create new key" and
choose JSON.
- Place this JSON credential file in the same folder as the other files for your Docker image.
- In your Dockerfile set an environment variable for this file 

    ENV GOOGLE_APPLICATION_CREDENTIALS='[PATH]'
- Where path is the location that you copy the file to in your Docker image. e.g.,

    ENV GOOGLE_APPLICATION_CREDENTIALS='./hw8-23-spring-xyz.json'
- You should treat this like a password of sorts. It grants access to read and write in your Datastore.
So don't share it and keep the container this key is in private.
