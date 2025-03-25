import { App, BlockButtonAction, ViewSubmitAction } from '@slack/bolt';
import { apiClient } from '../utils';
import { viewHomeUnit } from '../views/view-home-unit';

const actionAddNewUnit = (app: App): void => {
    app.action<BlockButtonAction>('actionId-add-new-unit', async ({ ack, body, client }) => {
        await ack();

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'submit_new_unit',
                title: {
                    type: 'plain_text',
                    text: 'Add New Unit'
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
                        block_id: 'blockId-unit-name',
                        element: {
                            type: 'plain_text_input',
                            action_id: 'actionId-unit-name-input'
                        },
                        label: {
                            type: 'plain_text',
                            text: 'Unit Name'
                        }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>('submit_new_unit', async ({ ack, body, view, client, logger }) => {
        await ack();

        const unitName = view.state.values['blockId-unit-name']['actionId-unit-name-input'].value;

        try {
            await apiClient.post('/units/', { name: unitName });
            const newView = await viewHomeUnit();
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
    actionAddNewUnit(app);
}
