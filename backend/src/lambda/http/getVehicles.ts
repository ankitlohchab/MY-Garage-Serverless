import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import {getUserIdFromEvent} from "../../auth/utils";
import {VehicleAccess} from "../../dataLayer/VehicleAccess";

const vehicleAccess = new VehicleAccess();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const userId = getUserIdFromEvent(event);

    const vehicles = await vehicleAccess.getVehicles(userId);

    // Send results
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items: vehicles
        })
    }
};
