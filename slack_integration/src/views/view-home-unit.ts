import { apiClient } from '../utils';
import { View } from "@slack/types";
import { buildViewHomeMasterData } from "./view-home-master-data";

export const viewHomeUnit = async (): Promise<View> => {
    const response = await apiClient.get('/units/');
    const units = response.data;

    return buildViewHomeMasterData(units, {
        header: 'Manage Units 📏',
        introText: 'List of your units:',
        addButtonText: '➕ Add New Unit',
        actionPrefix: 'unit',
        callbackId: 'manage_units_view'
    });
};
