import { DynamoDBDocumentClient, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
import { buildResponse } from '../utils';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({region: "us-east-1"});
const docClient = DynamoDBDocumentClient.from(client);

const selectById = async (event: any) => {
  
  const id = event.pathParameters.id;
    const command = new BatchGetCommand({
        RequestItems: {
            Products: {
              Keys: [
                {
                  id: id,
                },
              ],
            },
            Stocks: {
                Keys: [
                    {
                        id: id,
                    },
                ],
            }
          },
        });
      const response = await docClient.send(command);
      const product = {...response.Responses.Products[0], ...response.Responses.Stocks[0] };
      return product;
};

export const handler = async (event: any) => {
    try {
        return selectById(event);
    } catch (err) {
      console.log(err);
        return buildResponse(500, {
          message: err.message,
        });
    }
};