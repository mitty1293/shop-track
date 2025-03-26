import { apiClient } from '../utils';
import { View } from '@slack/types';
import { buildViewHomeMasterData } from './view-home-master-data';

export const viewHomeProduct = async (): Promise<View> => {
    const response = await apiClient.get('/products/');
    const products = response.data;

    return buildViewHomeMasterData(products, {
        header: 'Manage Products 📦',
        introText: 'List of your products:',
        addButtonText: '➕ Add New Product',
        actionPrefix: 'product',
        callbackId: 'manage_products_view'
    });
};
