import { buildResponse } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import { BatchWriteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({region: "us-east-1"});

const createProduct = async (event: any ) => {
    const id = uuidv4();
    const body = JSON.parse(event.body);
    const command = new BatchWriteItemCommand({
      RequestItems: {
        Products: [
          {
            PutRequest: {
              Item: {
                id: { S: id },
                title: { S: body.title },
                description: { S: body.description},
                price: { N: body.price},
              },
            },
          },
        ],
        Stocks: [
            {
            PutRequest: {
                Item: {
                    id: { S: id },
                    count: { N: body.count },
                },
            },
        },
        ]
      },
    });

  const response = await client.send(command);
  console.log(response);
  return response;
};

export const handler = async (event: any) => {
    try {
        return createProduct(event); //todo: build custom response
    } catch (err) {
        return buildResponse(500, {
            message: err.message,
        });
    }
};