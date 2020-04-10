import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {Vehicle} from "../models/Vehicle";
import * as uuid from 'uuid'
import { createLogger } from '../utils/logger'
import {CreateVehicleRequest} from "../requests/CreateVehicleRequest";
import {UpdateVehicleRequest} from "../requests/UpdateVehicleRequest";
const logger = createLogger('vehicleAccess');

const bucketName = process.env.VEHICLE_S3_BUCKET_NAME;

const XAWS = AWSXRay.captureAWS(AWS);

export class VehicleAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly vehicleTable = process.env.VEHICLE_TABLE,
        private readonly index = process.env.VEHICLE_TABLE_GSI ) {
    }

    async getVehicles(userId: string): Promise<Vehicle[]> {
        logger.info('Fetching all vehicles for userId', {userId: userId})

        const result = await this.docClient.query({
            TableName: this.vehicleTable,
            IndexName: this.index,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = result.Items

        logger.info("Fetching complete.", items)

        return items as Vehicle[]
    }

    async createVehicle(userId: string, newVehicle: CreateVehicleRequest): Promise<string> {
        const vehicleId = uuid.v4();

        const newVehicleWithAdditionalInfo = {
            userId: userId,
            vehicleId: vehicleId,
            ...newVehicle
        }

        logger.info("Creating new Vehicle object:", newVehicleWithAdditionalInfo);

        await this.docClient.put({
            TableName: this.vehicleTable,
            Item: newVehicleWithAdditionalInfo
        }).promise();

        logger.info("Create complete.")

        return vehicleId;

    }

    async deleteVehicle(vehicleId: string) {
        logger.info("Deleting Vehicle:", {vehicleId: vehicleId});
        await this.docClient.delete({
            TableName: this.vehicleTable,
            Key: {
                "vehicleId": vehicleId
            }
        }).promise();
        logger.info("Delete complete.", {vehicleId: vehicleId});
    }

    async updateVehicle(vehicleId: string, updatedVehicle: UpdateVehicleRequest){

        logger.info("Updating Vehicle:", {
            vehicleId: vehicleId,
            updatedVehicle: updatedVehicle
        });
        await this.docClient.update({
            TableName: this.vehicleTable,
            Key: {
                "vehicleId": vehicleId
            },
            UpdateExpression: "set #VehiclName = :vehicleNumber, insuranceValid = :insuranceValid, insuranceExpiry = :insuranceExpiry",
            ExpressionAttributeNames: {
                "#VehiclName": "vehicleNumber"
            },
            ExpressionAttributeValues: {
                ":vehicleNumber": updatedVehicle.vehicleNumber,
                ":insuranceValid": updatedVehicle.insuranceValid,
                ":insuranceExpiry": updatedVehicle.insuranceExpiry
            }
        }).promise()

        logger.info("Update complete.")

    }

    async updateVehicleAttachmentUrl(vehicleId: string, attachmentUrl: string){

        logger.info(`Updating vehicleId ${vehicleId} with attachmentUrl ${attachmentUrl}`)

        await this.docClient.update({
            TableName: this.vehicleTable,
            Key: {
                "vehicleId": vehicleId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${bucketName}.s3.amazonaws.com/${attachmentUrl}`
            }
        }).promise();
    }

}
