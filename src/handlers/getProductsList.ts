import { buildResponse } from '../utils';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({region: "us-east-1"});
// const dynamodb = DynamoDBDocumentClient.from(client);

const selectAll = async () => {
    const command1 = new ScanCommand({
        TableName: "Products",
      });
    // const command2 = new ScanCommand({
    //     TableName: "Stocks",
    // })
      const response1 = await client.send(command1);
    //   const response2 = await dynamodb.send(command2);
      const products = [];
    //   response1.Items.forEach( (el, idx) => products[idx] = {...el} );
      
      return response1; ////////////////////////////////////////dorobic scan z Stocks i poskładać to
};

export const handler = async (event: any) => {
    try {
        return selectAll();
    } catch (err) {
        return buildResponse(500, {
            message: err.message,
        });
    }
};