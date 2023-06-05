import { buildResponse } from '../utils';
import products from '../../data/products.json';

export const handler = async (event: any) => {
    try {
        console.log('aloha', event);
        return buildResponse(200, {
            products,
        });
    } catch (err) {
        return buildResponse(500, {
            message: err.message,
        });
    }
};