import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import {VehicleAccess} from "../../dataLayer/VehicleAccess";

const vehicleAccess = new VehicleAccess();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const vehicleId = event.pathParameters.vehicleId;

  await vehicleAccess.deleteVehicle(vehicleId);

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
};
