import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as uuid from 'uuid';
import * as AWS from 'aws-sdk';
import * as AWSXRay from "aws-xray-sdk";

import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

const XAWS = AWSXRay.captureAWS(AWS);

const bucketName = process.env.VEHICLE_S3_BUCKET_NAME;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

import {VehicleAccess} from "../../dataLayer/VehicleAccess";

const vehicleAccess = new VehicleAccess();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const vehicleId = event.pathParameters.vehicleId;
  const attachmentId = uuid.v4();

  logger.info("Generating upload URL:", {
    vehicleId: vehicleId,
    attachmentId: attachmentId
  });

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachmentId,
    Expires: urlExpiration
  });

  await vehicleAccess.updateVehicleAttachmentUrl(vehicleId, attachmentId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: uploadUrl
    })
  }
};
