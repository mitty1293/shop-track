import { App, BlockButtonAction, ViewSubmitAction } from '@slack/bolt';
import { apiClient } from '../utils';
import { viewHomeProduct } from '../views/view-home-product';

export const actionCrudProduct = (app: App): void => {
    // ➕ Add
    app.action<BlockButtonAction>('actionId-add-new-product', async ({ ack, body, client }) => {
        await ack();

        const [categories, units, manufacturers, origins] = await Promise.all([
            apiClient.get('/categories/'),
            apiClient.get('/units/'),
            apiClient.get('/manufacturers/'),
            apiClient.get('/origins/')
        ]);

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
                callback_id: 'submit_new_product',
                title: { type: 'plain_text', text: 'Add Product' },
                submit: { type: 'plain_text', text: 'Save' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'input',
                        block_id: 'blockId-product-name',
                        element: {
                            type: 'plain_text_input',
                            action_id: 'actionId-product-name-input'
                        },
                        label: { type: 'plain_text', text: 'Product Name' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-product-category',
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-product-category-select',
                            options: toOptions(categories.data)
                        },
                        label: { type: 'plain_text', text: 'Category' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-product-unit',
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-product-unit-select',
                            options: toOptions(units.data)
                        },
                        label: { type: 'plain_text', text: 'Unit' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-product-manufacturer',
                        optional: true,
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-product-manufacturer-select',
                            options: toOptions(manufacturers.data)
                        },
                        label: { type: 'plain_text', text: 'Manufacturer (optional)' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-product-origin',
                        optional: true,
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-product-origin-select',
                            options: toOptions(origins.data)
                        },
                        label: { type: 'plain_text', text: 'Origin (optional)' }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>('submit_new_product', async ({ ack, view, body, client, logger }) => {
        await ack();

        const get = (block: string, action: string) =>
            view.state.values[block][action]?.selected_option?.value ||
            view.state.values[block][action]?.value;

        try {
            const name = get('blockId-product-name', 'actionId-product-name-input');
            const categoryIdStr = get('blockId-product-category', 'actionId-product-category-select');
            const unitIdStr = get('blockId-product-unit', 'actionId-product-unit-select');
            const manufacturerIdStr = get('blockId-product-manufacturer', 'actionId-product-manufacturer-select');
            const originIdStr = get('blockId-product-origin', 'actionId-product-origin-select');

            if (!name || !categoryIdStr || !unitIdStr) {
                throw new Error('Required fields (name, category, unit) are missing.');
            }

            const payload = {
                name,
                category: parseInt(categoryIdStr),
                unit: parseInt(unitIdStr),
                manufacturer: manufacturerIdStr ? parseInt(manufacturerIdStr) : null,
                origin: originIdStr ? parseInt(originIdStr) : null
            };

            await apiClient.post('/products/', payload);
            const newView = await viewHomeProduct();
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error('Failed to add new product:', error);
        }
    });

    // ✏️ Edit
    app.action<BlockButtonAction>('actionId-edit-product', async ({ ack, body, client, action }) => {
        await ack();
        const id = parseInt(action.value ?? '0');

        const [productRes, categoriesRes, unitsRes, manufacturersRes, originsRes] = await Promise.all([
            apiClient.get(`/products/${id}/`),
            apiClient.get('/categories/'),
            apiClient.get('/units/'),
            apiClient.get('/manufacturers/'),
            apiClient.get('/origins/')
        ]);

        const product = productRes.data;

        const toOptions = (items: { id: number; name: string }[]): { text: { type: 'plain_text'; text: string }; value: string }[] => {
            return items.map((item) => ({
                text: { type: 'plain_text', text: item.name },
                value: item.id.toString()
            }));
        }

        const findInitialOption = (list: { id: number; name: string }[], id?: number | null): { text: { type: 'plain_text'; text: string }; value: string } | undefined => {
            const item = list.find((i) => i.id === id);
            return item ? { text: { type: 'plain_text', text: item.name }, value: item.id.toString() } : undefined;
        };

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'submit_edit_product',
                private_metadata: id.toString(),
                title: { type: 'plain_text', text: 'Edit Product' },
                submit: { type: 'plain_text', text: 'Update' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'input',
                        block_id: 'blockId-product-name',
                        element: {
                            type: 'plain_text_input',
                            action_id: 'actionId-product-name-input',
                            initial_value: product.name
                        },
                        label: { type: 'plain_text', text: 'Product Name' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-product-category',
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-product-category-select',
                            options: toOptions(categoriesRes.data),
                            initial_option: findInitialOption(categoriesRes.data, product.category.id)
                        },
                        label: { type: 'plain_text', text: 'Category' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-product-unit',
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-product-unit-select',
                            options: toOptions(unitsRes.data),
                            initial_option: findInitialOption(unitsRes.data, product.unit.id)
                        },
                        label: { type: 'plain_text', text: 'Unit' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-product-manufacturer',
                        optional: true,
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-product-manufacturer-select',
                            options: toOptions(manufacturersRes.data),
                            initial_option: findInitialOption(manufacturersRes.data, product.manufacturer?.id)
                        },
                        label: { type: 'plain_text', text: 'Manufacturer (optional)' }
                    },
                    {
                        type: 'input',
                        block_id: 'blockId-product-origin',
                        optional: true,
                        element: {
                            type: 'static_select',
                            action_id: 'actionId-product-origin-select',
                            options: toOptions(originsRes.data),
                            initial_option: findInitialOption(originsRes.data, product.origin?.id)
                        },
                        label: { type: 'plain_text', text: 'Origin (optional)' }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>('submit_edit_product', async ({ ack, view, body, client, logger }) => {
        await ack();

        const get = (block: string, action: string) =>
            view.state.values[block][action]?.selected_option?.value ||
            view.state.values[block][action]?.value;

        try {
            const id = parseInt(view.private_metadata);
            const name = get('blockId-product-name', 'actionId-product-name-input');
            const categoryIdStr = get('blockId-product-category', 'actionId-product-category-select');
            const unitIdStr = get('blockId-product-unit', 'actionId-product-unit-select');
            const manufacturerIdStr = get('blockId-product-manufacturer', 'actionId-product-manufacturer-select');
            const originIdStr = get('blockId-product-origin', 'actionId-product-origin-select');

            if (!name || !categoryIdStr || !unitIdStr) {
                throw new Error('Required fields (name, category, unit) are missing.');
            }

            const payload = {
                name,
                category: parseInt(categoryIdStr),
                unit: parseInt(unitIdStr),
                manufacturer: manufacturerIdStr ? parseInt(manufacturerIdStr) : null,
                origin: originIdStr ? parseInt(originIdStr) : null
            };

            await apiClient.patch(`/products/${id}/`, payload);
            const newView = await viewHomeProduct();
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error('Failed to update product:', error);
        }
    });

    // 🗑️ Delete
    app.action<BlockButtonAction>('actionId-delete-product', async ({ ack, client, body, action }) => {
        await ack();

        const id = parseInt(action.value ?? '0');
        const response = await apiClient.get(`/products/${id}/`);
        const product = response.data;

        await client.views.open({
            trigger_id: body.trigger_id,
            view: {
                type: 'modal',
                callback_id: 'submit_delete_product',
                private_metadata: id.toString(),
                title: { type: 'plain_text', text: 'Delete Product' },
                submit: { type: 'plain_text', text: 'Delete' },
                close: { type: 'plain_text', text: 'Cancel' },
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `Are you sure you want to delete *${product.name}*?\nThis action cannot be undone.`
                        }
                    }
                ]
            }
        });
    });

    app.view<ViewSubmitAction>('submit_delete_product', async ({ ack, view, body, client, logger }) => {
        await ack();

        try {
            const id = parseInt(view.private_metadata);
            await apiClient.delete(`/products/${id}/`);

            const newView = await viewHomeProduct();
            await client.views.publish({ user_id: body.user.id, view: newView });
        } catch (error) {
            logger.error('Failed to delete product:', error);
        }
    });


};
