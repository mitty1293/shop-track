import { App, BlockButtonAction } from '@slack/bolt';
import { apiClient } from '../utils';
import { viewHomeRecords } from '../views/view-home-records';

export const actionViewRecords = (app: App) => {
    app.action<BlockButtonAction>('actionId-view-records', async ({ ack, body, client, logger }) => {
        await ack();

        try {
            const response = await apiClient.get('/shopping-records/');
            const records = response.data;

            const view = viewHomeRecords(records);

            await client.views.publish({
                user_id: body.user.id,
                view
            });
        } catch (error) {
            logger.error('Failed to fetch records:', error);
        }
    });
}
