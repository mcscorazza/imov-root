import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient({
  region: process.env.AWS_DEFAULT_REGION || "sa-east-1",
});

const dynamo = DynamoDBDocumentClient.from(dbClient);

export default dynamo;
