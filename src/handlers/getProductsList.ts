import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { buildResponse } from '../utils';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({region: "us-east-1"});
const docClient = DynamoDBDocumentClient.from(client);

const selectAll = async () => {
    const command1 = new ScanCommand({
        TableName: "Products",
      });
    const command2 = new ScanCommand({
        TableName: "Stocks",
    })
      const response1 = await docClient.send(command1);
      const response2 = await docClient.send(command2);
      const products = [];
      
      response1.Items.forEach( (el, idx) => {
        products[idx] = {...el, ...response2.Items[idx]}
      });

      
      return products;
};

export const handler = async (event: any) => {
    console.info("EVENT\n" + JSON.stringify(event, null, 2));
    try {
        return selectAll();
    } catch (err) {
        return buildResponse(500, {
            message: err.message,
        });
    }
};