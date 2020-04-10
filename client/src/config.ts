// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'uzxrumukq1'
const region = 'us-east-1'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'ankitlohchab.auth0.com',            // Auth0 domain
  clientId: 'BjwtIb3YZ1SEM21TJw3w0O4wFHyDC2CL',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
