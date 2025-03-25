import { App, BlockAction, ButtonAction, ViewSubmitAction } from "@slack/bolt";
import { apiClient } from "../utils";
import { viewHomeCategory } from "../views/view-home-category";

const actionDeleteCategory = (app: App): void => {
    app.action<BlockAction<ButtonAction>>('actionId-delete-category', async ({ ack, body, client, action, logger }) => {
        await ack();

        const categoryId = parseInt(action.value ?? '0');
        if (!categoryId) {
            logger.warn('Invalid category ID received');
            return;
        }

        try {
            const response = await apiClient.get(`/categories/${categoryId}/`);
            const category = response.data;

            await client.views.open({
                trigger_id: body.trigger_id,
                view: {
                    type: 'modal',
                    callback_id: 'submit_delete_category',
                    private_metadata: category.id.toString(),
                    title: {
                        type: 'plain_text',
                        text: 'Delete Category'
                    },
                    submit: {
                        type: 'plain_text',
                        text: 'Delete'
                    },
                    close: {
                        type: 'plain_text',
                        text: 'Cancel'
                    },
                    blocks: [
                        {
                            type: 'section',
                            text: {
                                type: 'mrkdwn',
                                text: `Are you sure you want to delete category *#${category.name}*?`
                            }
                        }
                    ]
                }
            });
        } catch (error) {
            console.error(error);
        }
    });

    app.view<ViewSubmitAction>('submit_delete_category', async ({ ack, body, view, client }) => {
        await ack();

        const categoryId = parseInt(view.private_metadata);

        try {
            await apiClient.delete(`/categories/${categoryId}/`);
            const newView = await viewHomeCategory();
            await client.views.publish({
                user_id: body.user.id,
                view: newView
            });
        } catch (error) {
            console.error(error);
        }
    });
};

export const register = (app: App): void => {
    actionDeleteCategory(app);
};
