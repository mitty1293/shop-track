import { App, BlockAction, StaticSelectAction } from '@slack/bolt';
import { apiClient } from '../utils';

const appHomeManageMaster = (app: App): void => {
    app.action<BlockAction<StaticSelectAction>>('actionId-manage-master-data', async ({ ack, body, client, action }) => {
        await ack();
        console.log(action);
        const selectedOption = action.selected_option.value;

        if (selectedOption === 'manage_categories') {
            try {
                const response = await apiClient.get('/categories');
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        }
    });
}

export const register = (app: App): void => {
    appHomeManageMaster(app);
}