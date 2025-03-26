import { apiClient } from '../utils';
import { View } from '@slack/types';
import { buildViewHomeMasterData } from './view-home-master-data';

export const viewHomeStore = async (): Promise<View> => {
    const response = await apiClient.get('/stores/');
    const stores = response.data;

    return buildViewHomeMasterData(stores, {
        header: 'Manage Stores 🏪',
        introText: 'List of your stores:',
        addButtonText: '➕ Add New Store',
        actionPrefix: 'store',
        callbackId: 'manage_stores_view'
    });
};
