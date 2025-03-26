import { App, BlockAction, StaticSelectAction } from '@slack/bolt';
import { View } from '@slack/types/dist/views';
import { viewHomeCategory } from '../views/view-home-category';
import { viewHomeUnit } from '../views/view-home-unit';
import { viewHomeManufacturer } from '../views/view-home-manufacturer';
import { viewHomeOrigin } from '../views/view-home-origin';
import { viewHomeStore } from '../views/view-home-store';
import { viewHomeProduct } from '../views/view-home-product';

const viewMap: Record<string, () => Promise<View>> = {
    manage_categories: viewHomeCategory,
    manage_units: viewHomeUnit,
    manage_manufacturers: viewHomeManufacturer,
    manage_origins: viewHomeOrigin,
    manage_stores: viewHomeStore,
    manage_products: viewHomeProduct
};

const actionManageMasterData = (app: App): void => {
    app.action<BlockAction<StaticSelectAction>>('actionId-manage-master-data', async ({ ack, body, client, action }) => {
        await ack();
        const selectedOption = action.selected_option.value;
        const newView = await viewMap[selectedOption]();
        await client.views.publish({
            user_id: body.user.id,
            view: newView
        });
    });
}

export const register = (app: App): void => {
    actionManageMasterData(app);
}
