import { PublishCommand } from '@aws-sdk/client-sns'; // na gorze jest jeszcze jeden import

import { createProduct } from '../handlers/createProduct'; //chyba ze skryptow co pisane byly
import { SNSClient } from '@aws-sdk/client-sns'; //tu jest inny import z lib jakiegos 12:43
import { buildResponse } from '../utils';

export const handler = async (event) => {
    const snsClient = new SNSClient();
    
    try {
        console.log(JSON.stringify({ event }));
        const records = event.Records;

        for (const record of records) {
            const newProductData = await createProduct(JSON.parse(record.body));

            console.log(newProductData);

            await snsClient.send( 
                new PublishCommand({
                    Subject: 'New Files Added to Catalog',
                    Message: JSON.stringify(newProductData),
                    TopicArn: process.env.IMPORT_PRODUCTS_TOPIC_ARN,
                    MessageAttributes: {
                        count: {
                            DataType: 'Number',
                            StringValue: newProductData.count,
                        },
                    },
                })
            );
        }

        return buildResponse(200, records);
    } catch (err) {
        console.log(err);
        return buildResponse(500, err);
    }
};
