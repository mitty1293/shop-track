import { App, BlockAction, StaticSelectAction } from '@slack/bolt';
import { viewHomeCategory } from '../views/view-home-category';

const actionManageMasterData = (app: App): void => {
    app.action<BlockAction<StaticSelectAction>>('actionId-manage-master-data', async ({ ack, body, client, action }) => {
        await ack();
        const selectedOption = action.selected_option.value;

        if (selectedOption === 'manage_categories') {
            try {
                const newView = await viewHomeCategory();
                await client.views.publish({
                    user_id: body.user.id,
                    view: newView
                });
            } catch (error) {
                console.error(error);
            }
        }
    });
}

export const register = (app: App): void => {
    actionManageMasterData(app);
}
