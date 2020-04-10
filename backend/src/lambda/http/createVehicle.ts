import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateVehicleRequest } from '../../requests/CreateVehicleRequest'
import {getUserIdFromEvent} from "../../auth/utils";
import {VehicleAccess} from "../../dataLayer/VehicleAccess";

const vehicleAccess = new VehicleAccess();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const userId = getUserIdFromEvent(event);

  const newVehicle: CreateVehicleRequest = JSON.parse(event.body);
  const vehicleId = await vehicleAccess.createVehicle(userId, newVehicle);

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item:
          {
            vehicleId: vehicleId,
            ...newVehicle
          }
    })
  };
};
