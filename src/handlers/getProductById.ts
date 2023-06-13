import { buildResponse } from '../utils';
import { BatchGetItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({region: "us-east-1"});

const selectById = async (event: any) => {
  
  const id = event.pathParameters.id;
  console.log(id);
    const command = new BatchGetItemCommand({
        RequestItems: {
            Products: {
              Keys: [
                {
                  id: { S: id },
                },
              ],
              ProjectionExpression: "id, title, description, price",
            },
            Stocks: {
                Keys: [
                    {
                        id: { S: id },
                    },
                ],
                ProjectionExpression: "#c",
                ExpressionAttributeNames: {"#c": "count"},
            }
          },
        });
      const response = await client.send(command);
      const product = {...response.Responses.Products[0], ...response.Responses.Stocks[0] };
      return product;
};

export const handler = async (event: any) => {
    try {
      console.log(event);
        return selectById(event);
    } catch (err) {
      console.log(err);
        return buildResponse(500, {
            event,
        });
    }
};