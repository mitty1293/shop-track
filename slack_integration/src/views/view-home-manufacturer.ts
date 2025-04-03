import { apiClient } from '../utils';
import { View } from '@slack/types';
import { buildViewHomeMasterData } from './view-home-master-data';

export const viewHomeManufacturer = async (): Promise<View> => {
    const response = await apiClient.get('/manufacturers/');
    const manufacturers = response.data;

    return buildViewHomeMasterData(manufacturers, {
        header: 'Manage Manufacturers 🏭',
        introText: 'List of your manufacturers:',
        addButtonText: '➕ Add New Manufacturer',
        actionPrefix: 'manufacturer',
        callbackId: 'manage_manufacturers_view'
    });
};
