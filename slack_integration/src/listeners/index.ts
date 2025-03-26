import { App } from '@slack/bolt';
import { register as registerActionManageMasterData } from './action-manage-master-data';
import { actionCrudMasterData } from './action-crud-master-data';
import { viewHomeCategory } from '../views/view-home-category';
import { viewHomeUnit } from '../views/view-home-unit';
import { viewHomeManufacturer } from '../views/view-home-manufacturer';
import { viewHomeOrigin } from '../views/view-home-origin';
import { viewHomeStore } from '../views/view-home-store';
import { viewHomeProduct } from '../views/view-home-product';
import { register as registerEventAppHomeOpened } from './event-app-home-opened';

export const registerListeners = (app: App): void => {
    // ホームタブ表示イベント
    registerEventAppHomeOpened(app);

    // マスタデータ選択セレクトメニュー
    registerActionManageMasterData(app);

    // 各マスタに対して共通CRUDリスナーを登録
    actionCrudMasterData(app, {
        masterName: 'category',
        apiPath: '/categories/',
        viewBuilder: viewHomeCategory
    });

    actionCrudMasterData(app, {
        masterName: 'unit',
        apiPath: '/units/',
        viewBuilder: viewHomeUnit
    });

    actionCrudMasterData(app, {
        masterName: 'manufacturer',
        apiPath: '/manufacturers/',
        viewBuilder: viewHomeManufacturer
    });

    actionCrudMasterData(app, {
        masterName: 'origin',
        apiPath: '/origins/',
        viewBuilder: viewHomeOrigin
    });

    actionCrudMasterData(app, {
        masterName: 'store',
        apiPath: '/stores/',
        viewBuilder: viewHomeStore
    });

    actionCrudMasterData(app, {
        masterName: 'product',
        apiPath: '/products/',
        viewBuilder: viewHomeProduct
    });
};
