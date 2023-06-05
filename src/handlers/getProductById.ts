import { buildResponse } from "../utils"
import products from '../../data/products.json';
export const handler = async (event: any) => {
    try {
        console.log('aloha', event);
        let product = products.find(product => product.id == event.pathParameters?.id);
        return buildResponse(200, {
            product,
        });
    } catch (err) {
        return buildResponse(500, {
            message: err.message,
        });
    }
};