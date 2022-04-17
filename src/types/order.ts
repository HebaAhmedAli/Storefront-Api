import { OrderProduct } from './order-product';

export type Order = {
    id?: number;
    status: string;
    userId: number;
    orderProducts: OrderProduct[];
};
