import { App, BlockButtonAction, ViewSubmitAction } from '@slack/bolt';
import { apiClient } from '../utils';
import { viewHomeCategory } from '../views/view-home-category';

const actionAddNewCategory = (app: App): void => {
    app.action<BlockButtonAction>('actionId-add-new-category', async ({ ack, body, client }) => {
        await ack();

        try {
            await client.views.open({
                trigger_id: body.trigger_id,
                view: {
                    type: 'modal',
                    callback_id: 'submit_new_category',
                    title: {
                        type: 'plain_text',
                        text: 'Add New Category'
                    },
                    submit: {
                        type: 'plain_text',
                        text: 'Save'
                    },
                    close: {
                        type: 'plain_text',
                        text: 'Cancel'
                    },
                    blocks: [
                        {
                            type: 'input',
                            block_id: 'blockId-category-name',
                            element: {
                                type: 'plain_text_input',
                                action_id: 'actionId-category-name-input'
                            },
                            label: {
                                type: 'plain_text',
                                text: 'Category Name'
                            }
                        }
                    ]
                }
            });
        } catch (error) {
            console.error(error);
        }
    });

    app.view<ViewSubmitAction>('submit_new_category', async ({ ack, body, view, client }) => {
        await ack();

        const categoryName = view.state.values['blockId-category-name']['actionId-category-name-input'].value;
        try {
            await apiClient.post('/categories/', { name: categoryName });
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
    actionAddNewCategory(app);
}
