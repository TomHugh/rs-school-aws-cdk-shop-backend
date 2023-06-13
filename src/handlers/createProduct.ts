import { buildResponse } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import { BatchWriteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({region: "us-east-1"});

const createProduct = async (title: string, description: string, price: number, count: number ) => {
    const id = uuidv4();
    const command = new BatchWriteItemCommand({
      RequestItems: {
        Products: [
          {
            PutRequest: {
              Item: {
                id: { S: id },
                title: { S: title },
                description: { S: description},
                price: { N: price},
              },
            },
          },
        ],
        Stocks: [
            {
            PutRequest: {
                Item: {
                    id: { S: id },
                    count: { N: count },
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
        return createProduct(event.title, event.description, event.price, event.count); //todo: build custom response
    } catch (err) {
        return buildResponse(500, {
            message: err.message,
        });
    }
};