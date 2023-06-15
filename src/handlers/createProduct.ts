import { buildResponse } from '../utils';
import { v4 as uuidv4 } from 'uuid';
import { BatchWriteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({region: "us-east-1"});

const createProduct = async (event: any ) => {
    const id = uuidv4();
    const body = JSON.parse(event.body);
    if (body.title == "" || body.price <= 0 || body.count < 0) throw new Error ("Wrong or empty parameter");
    const command = new BatchWriteItemCommand({
      RequestItems: {
        Products: [
          {
            PutRequest: {
              Item: {
                id: { S: id },
                title: { S: body.title },
                description: { S: body.description},
                price: { N: body.price.toString() },
              },
            },
          },
        ],
        Stocks: [
            {
            PutRequest: {
                Item: {
                    id: { S: id },
                    count: { N: body.count.toString() },
                },
            },
        },
        ]
      },
    });

  const response = await client.send(command);
  return response;
};

export const handler = async (event: any) => {
  console.info("EVENT\n" + JSON.stringify(event, null, 2));
  try {
        await createProduct(event);
        return buildResponse(200, {
          message: `Successfully created product`
        });
    } catch (err) {
        if (err === "Wrong or empty parameter")
        return buildResponse(400, {
          message : err.message
        });
        return buildResponse(500, {
            message: err.message,
        });
    }
};