#  My Garage Application (Serverless)

# Functionality of the application

This application will allow creating/removing/updating/fetching Vehicles in your Garage. Each Vehicle optionally have an attachment image. Each user only has access to vehicles that he/she has created.

# TODO items

The application should store Vehicles, and each Vehicle contains the following fields:

* `vehicleId` (string) - a unique id for a vehicle
* `createdAt` (string) - date and time when an vehicle was added
* `vehicleNumber` (string) - vehicle Number (e.g. "DL1RTA0338")
* `insuranceExpiry` (string) - date and time when insurance Expires
* `insuranceValid` (boolean) - true if insurance is valid, false otherwise
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a Vehicle

You might also store an id of a user who added the vehicle.


# Functions to be implemented

To implement this project, you need to implement the following functions and configure them in the `serverless.yml` file:

* `Auth` - this function should implement a custom authorizer for API Gateway that should be added to all other functions.

* `GetVehicles` - should return all Vehicles for a current user. A user id can be extracted from a JWT token that is sent by the frontend

It should return data that looks like this:

```json
{
    "items": [
        {
            "vehicleNumber": "DL1RTA0226",
            "insuranceExpiry": "2021-04-10",
            "vehicleId": "a4988c5a-a43c-468f-8a9b-555bf416fda6",
            "userId": "google-oauth2|113280470668489997874",
            "attachmentUrl": "https://serverless-app-vehicle-dev.s3.amazonaws.com/8739ddec-f91b-4dbd-899b-d5618a0881f3"
        },
		{
            "vehicleNumber": "DL7SAG1243",
            "insuranceExpiry": "2021-04-10",
            "vehicleId": "a4988c5a-a43c-468f-834b-555bf416fda6",
            "userId": "google-oauth2|422444470668489997874",
            "attachmentUrl": "https://serverless-app-vehicle-dev.s3.amazonaws.com/8739ddec-f91b-4dbd-899b-d5618a0881f3"
        }
    ]
}
```

* `CreateVehicle` - should create a new Vehicle for a current user. A shape of data send by a client application to this function can be found in the `CreateVehicleRequest.ts` file

It receives a new VEHICLE to be created in JSON format that looks like this:

```json
{
   "vehicleNumber": "DL7SAG1243",
   "insuranceExpiry": "2021-04-10"
}
```

It should return a new VEHICLE that looks like this:

```json
{
    "item": {
        "vehicleId": "2e4ba923-0a5a-41f8-b35a-bbc65f0a37e7",
        "vehicleNumber": "DL1SAT2032",
        "insuranceExpiry": "2019-06-11"
    }
}
```

* `UpdateVehicle` - should update vehicle details created by a current user. A shape of data send by a client application to this function can be found in the `UpdateVehicleRequest.ts` file

It receives an object that contains three fields that can be updated in a VEHICLE:

```json
{
  "vehicleNumber": "DL7SAG1243",
  "insuranceExpiry": "2021-04-10",
  "insuranceValid": true
}
```

The id of an item that should be updated is passed as a URL parameter.

It should return an empty body.

* `DeleteVehicle` - should delete a Vehicle created by a current user. Expects an id of a Vehicle to remove.

It should return an empty body.

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a Vehicle.

It should return a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```

All functions are already connected to appropriate events from API Gateway.

An id of a user can be extracted from a JWT token passed by a client.

You also need to add any necessary resources to the `resources` section of the `serverless.yml` file such as DynamoDB table and S3 bucket.


# Frontend

The `client` folder contains a web application that can use the API that should be developed in the project.

This frontend should work with your serverless application once it is developed, you don't need to make any changes to the code. The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

To implement authentication in your application, you would have to create an Auth0 application and copy "domain" and "client id" to the `config.ts` file in the `client` folder. We recommend using asymmetrically encrypted JWT tokens.

# Best practices

To complete this exercise, please follow the best practices from the 6th lesson of this course.

## Logging

The starter code comes with a configured [Winston](https://github.com/winstonjs/winston) logger that creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. You can use it to write log messages like this:

```ts
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

// You can provide additional information with every log statement
// This information can then be used to search for log statements in a log storage system
logger.info('User was authorized', {
  // Additional information stored with a log statement
  key: 'value'
})
```


# Grading the submission

Once you have finished developing your application, please set `apiId` and Auth0 parameters in the `config.ts` file in the `client` folder. A reviewer would start the React development server to run the frontend that should be configured to interact with your serverless application.


# Suggestions

To store TODO items, you might want to use a DynamoDB table with local secondary index(es). A create a local secondary index you need to create a DynamoDB resource like this:

```yml


    VehicleTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.VEHICLE_TABLE}
        AttributeDefinitions:
          - AttributeName: vehicleId
            AttributeType: S
          - AttributeName: userId
            AttributeType: S
        KeySchema:
          - AttributeName: vehicleId
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
        GlobalSecondaryIndexes:
          - IndexName: ${self:provider.environment.VEHICLE_TABLE_GSI}
            KeySchema:
              - AttributeName: userId
                KeyType: HASH
            Projection:
              ProjectionType: ALL

```

To query an index you need to use the `query()` method like:

```ts
await this.dynamoDBClient
  .query({
    TableName: 'table-name',
    IndexName: 'index-name',
    KeyConditionExpression: 'paritionKey = :paritionKey',
    ExpressionAttributeValues: {
      ':paritionKey': partitionKeyValue
    }
  })
  .promise()
```

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless TODO application.

# Postman collection

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](images/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true "Image 5")

You will go to this screen where i have already made some test cases

![Alt text](images/import-collection-6.png?raw=true "Image 6")
