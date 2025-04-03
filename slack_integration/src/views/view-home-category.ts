import { apiClient } from "../utils";
import { View } from "@slack/types";
import { buildViewHomeMasterData } from "./view-home-master-data";

export const viewHomeCategory = async (): Promise<View> => {
    const response = await apiClient.get('/categories/');
    const categories = response.data;

    return buildViewHomeMasterData(categories, {
        header: 'Manage Categories 🗂️',
        introText: 'List of your categories:',
        addButtonText: '➕ Add New Category',
        actionPrefix: 'category',
        callbackId: 'manage_categories_view'
    });
};
