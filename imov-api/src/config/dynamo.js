const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const dbClient = new DynamoDBClient({ 
  region: process.env.AWS_DEFAULT_REGION || 'sa-east-1' 
});

const dynamo = DynamoDBDocumentClient.from(dbClient);

module.exports = dynamo;