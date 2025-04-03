import { App, BlockButtonAction, ViewSubmitAction } from '@slack/bolt';
import { apiClient } from '../utils';
import { viewHomeRecords } from '../views/view-home-records';

export const actionCrudRecord = (app: App): void => {
    // ➕ Add
    app.action<BlockButtonAction>('actionId-add-new-record', async ({ ack, body, client, logger }) => {
        await ack();

        try {
            const [productsResponse, storesResponse] = await Promise.all([
                apiClient.get('/products/'),
                apiClient.get('/stores/')
            ]);

            const products = productsResponse.data;
            const stores = storesResponse.data;

            if (products.length === 0 || stores.length === 0) {
                logger.error(':warning: Please register at least one *product* and *store* before adding a record.');
                return;
            }

            const toOptions = (items: { id: number; name: string }[]): { text: { type: 'plain_text'; text: string }; value: string }[] => {
                return items.map((item) => ({
                    text: { type: 'plain_text', text: item.name },
                    value: item.id.toString()
                }));
            }

            await client.views.open({
                trigger_id: body.trigger_id,
                view: {
                    type: 'modal',
                    callback_id: 'submit_new_record',
                    title: { type: 'plain_text', text: 'Add Record' },
                    submit: { type: 'plain_text', text: 'Save' },
                    close: { type: 'plain_text', text: 'Cancel' },
                    blocks: [
                        {
                            type: 'input',
                            block_id: 'blockId-record-product',
                            element: {
                                type: 'static_select',
                                action_id: 'actionId-record-product-select',
                                options: toOptions(products)
                            },
                            label: { type: 'plain_text', text: 'Product' }
                        },
                        {
                            type: 'input',
                            block_id: 'blockId-record-store',
                            element: {
                                type: 'static_select',
                                action_id: 'actionId-record-store-select',
                                options: toOptions(stores)
                            },
                            label: { type: 'plain_text', text: 'Store' }
                        },
                        {
                            type: 'input',
                            block_id: 'blockId-record-date',
                            element: {
                                type: 'datepicker',
                                action_id: 'actionId-record-date-select'
                            },
                            label: { type: 'plain_text', text: 'Purchase Date' }
                        },
                        {
                            type: 'input',
                            block_id: 'blockId-record-quantity',
                            element: {
                                type: 'plain_text_input',
                                action_id: 'actionId-record-quantity-input'
                            },
                            label: { type: 'plain_text', text: 'Quantity' }
                        },
                        {
                            type: 'input',
                            block_id: 'blockId-record-price',
                            element: {
                                type: 'plain_text_input',
                                action_id: 'actionId-record-price-input'
                            },
                            label: { type: 'plain_text', text: 'Price (JPY)' }
                        }
                    ]
                }
            });
        } catch (error) {
            logger.error('Failed to open Add Record modal:', error);
        }
    });

    app.view<ViewSubmitAction>('submit_new_record', async ({ ack, body, view, client, logger }) => {
        await ack();

        try {
            const get = (block: string, action: string): string | null =>
                view.state.values[block][action]?.value ?? null;

            const productIdStr = view.state.values['blockId-record-product']['actionId-record-product-select']?.selected_option?.value;
            const storeIdStr = view.state.values['blockId-record-store']['actionId-record-store-select']?.selected_option?.value;
            const purchaseDate = view.state.values['blockId-record-date']['actionId-record-date-select']?.selected_date;
            const quantity = get('blockId-record-quantity', 'actionId-record-quantity-input') ?? '0';
            const price = get('blockId-record-price', 'actionId-record-price-input') ?? '0';

            const payload = {
                product_id: parseInt(productIdStr ?? '0'),
                store_id: parseInt(storeIdStr ?? '0'),
                purchase_date: purchaseDate,
                quantity: parseFloat(quantity),
                price: parseFloat(price)
            };

            await apiClient.post('/shopping-records/', payload);
        } catch (error) {
            logger.error('Failed to create new record:', error);
        }
    });

    // ✏️ Edit
    app.action<BlockButtonAction>('actionId-edit-record', async ({ ack, body, client, action }) => {
        await ack();
        const recordId = parseInt(action.value ?? '0');
        const [recordRes, productsRes, storesRes] = await Promise.all([
            apiClient.get(`/shopping-records/${recordId}/`),
            apiClient.get('/products/'),
            apiClient.get('/stores/')
        ]);

        const record = recordRes.data;
        const products = productsRes.data;
        const stores = storesRes.data;

        const toOptions = (items: { id: number; name: string }[]): { text: { type: 'plain_text'; text: string }; value: string }[] => {
            return items.map((item) => ({
                text: { type: 'plain_text', text: item.name },
                value: item.id.toString()
            }));
        };

        const findInitialOption = (items: { id: number; name: string }[], id: number): { text: { type: 'plain_text'; text: string }; value: string } | undefined => {
            const item = items.find(i => i.id === id);
            return item ? {text: { type: 'plain_text', text: item.name }, value: id.toString() } : undefined;
        };

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'submit_edit_record',
                private_metadata: recordId.toString(),
                title: { type: 'plain_text', text: 'Edit Record' },
                submit: { type: 'plain_text', text: 'Update' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'input',
                        block_id: 'blockId-record-product',
                        label: { type: 'plain_text', text: 'Product' },
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-record-product',
                            options: toOptions(products),
                            initial_option: findInitialOption(products, record.product.id)
                        }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-record-store',
                        label: { type: 'plain_text', text: 'Store' },
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-record-store',
                            options: toOptions(stores),
                            initial_option: findInitialOption(stores, record.store.id)
                        }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-record-date',
                        label: { type: 'plain_text', text: 'Purchase Date' },
                        element: {
                            type: 'datepicker',
                            action_id: 'actionId-record-date',
                            initial_date: record.purchase_date
                        }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-record-quantity',
                        label: { type: 'plain_text', text: 'Quantity' },
                        element: {
                            type: 'plain_text_input',
                            action_id: 'actionId-record-quantity',
                            initial_value: record.quantity.toString()
                        }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-record-price',
                        label: { type: 'plain_text', text: 'Price (JPY)' },
                        element: {
                            type: 'plain_text_input',
                            action_id: 'actionId-record-price',
                            initial_value: record.price.toString()
                        }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>('submit_edit_record', async ({ ack, view, body, client, logger }) => {
        await ack();
        try {
            const get = (blockId: string, actionId: string) =>
                view.state.values[blockId][actionId]?.selected_option?.value ??
                view.state.values[blockId][actionId]?.value;

            const id = view.private_metadata;
            const payload = {
                product: parseInt(get('blockId-record-product', 'actionId-record-product') || '0'),
                store: parseInt(get('blockId-record-store', 'actionId-record-store') || '0'),
                purchase_date: get('blockId-record-date', 'actionId-record-date'),
                quantity: parseFloat(get('blockId-record-quantity', 'actionId-record-quantity') || '0'),
                price: parseFloat(get('blockId-record-price', 'actionId-record-price') || '0')
            };

            await apiClient.patch(`/shopping-records/${id}/`, payload);

            const res = await apiClient.get('/shopping-records/');
            const newView = viewHomeRecords(res.data);
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error('Failed to update record:', error);
        }
    });

    // 🗑️ Delete Record
    app.action<BlockButtonAction>('actionId-delete-record', async ({ ack, body, client, action }) => {
        await ack();
        const id = parseInt(action.value ?? '0');
        const response = await apiClient.get(`/shopping-records/${id}/`);
        const record = response.data;

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'submit_delete_record',
                private_metadata: id.toString(),
                title: { type: 'plain_text', text: 'Delete Record' },
                submit: { type: 'plain_text', text: 'Delete' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `Are you sure you want to delete *${record.product.name} (${record.purchase_date})*?`
                        }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>('submit_delete_record', async ({ ack, view, body, client, logger }) => {
        await ack();
        const id = parseInt(view.private_metadata);

        try {
            await apiClient.delete(`/shopping-records/${id}/`);
            const response = await apiClient.get('/shopping-records/');
            const viewRecords = viewHomeRecords(response.data);
            await client.views.publish({ user_id: body.user.id, view: viewRecords });
        } catch (error) {
            logger.error('Failed to delete record:', error);
        }
    });
};
