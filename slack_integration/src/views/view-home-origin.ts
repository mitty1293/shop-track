import { apiClient } from '../utils';
import { View } from '@slack/types';
import { buildViewHomeMasterData } from './view-home-master-data';

export const viewHomeOrigin = async (): Promise<View> => {
    const response = await apiClient.get('/origins/');
    const origins = response.data;

    return buildViewHomeMasterData(origins, {
        header: 'Manage Origins 🌍',
        introText: 'List of your origins:',
        addButtonText: '➕ Add New Origin',
        actionPrefix: 'origin',
        callbackId: 'manage_origins_view'
    });
};
