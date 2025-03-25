import { App, BlockAction, ButtonAction, ViewSubmitAction } from "@slack/bolt";
import { apiClient } from "../utils";
import { viewHomeCategory } from "../views/view-home-category";

const actionEditCategory = (app: App): void => {
    app.action<BlockAction<ButtonAction>>('actionId-edit-category', async ({ ack, body, client, action, logger }) => {
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
                    callback_id: 'submit_edit_category',
                    private_metadata: category.id.toString(),
                    title: {
                        type: 'plain_text',
                        text: 'Edit Category'
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
                                action_id: 'actionId-category-name-input',
                                initial_value: category.name
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

    app.view<ViewSubmitAction>('submit_edit_category', async ({ ack, body, view, client }) => {
        await ack();

        const categoryId = parseInt(view.private_metadata);
        const newCategoryName = view.state.values['blockId-category-name']['actionId-category-name-input'].value;

        try {
            await apiClient.put(`/categories/${categoryId}/`, { name: newCategoryName });
            const newView = await viewHomeCategory();
            await client.views.publish({
                user_id: body.user.id,
                view: newView
            });
        } catch (error) {
            console.error(error);
        }
    });
}

export const register = (app: App): void => {
    actionEditCategory(app);
}