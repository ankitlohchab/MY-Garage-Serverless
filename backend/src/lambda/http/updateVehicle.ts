import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateVehicleRequest } from '../../requests/UpdateVehicleRequest'
import {VehicleAccess} from "../../dataLayer/VehicleAccess";

const vehicleAccess = new VehicleAccess();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const vehicleId = event.pathParameters.vehicleId;

  const updatedVehicle: UpdateVehicleRequest = JSON.parse(event.body);

  await vehicleAccess.updateVehicle(vehicleId, updatedVehicle);

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
};
