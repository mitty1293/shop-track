import { App } from '@slack/bolt';
import { register as registerActionManageMasterData } from './action-manage-master-data';
import { actionCrudMasterData } from './action-crud-master-data';
import { actionCurdStore } from './action-crud-store';
import { actionCrudProduct } from './action-crud-product';
import { viewHomeCategory } from '../views/view-home-category';
import { viewHomeUnit } from '../views/view-home-unit';
import { viewHomeManufacturer } from '../views/view-home-manufacturer';
import { viewHomeOrigin } from '../views/view-home-origin';
import { actionViewRecords } from './action-view-records';
import { actionCrudRecord } from './action-crud-record';
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

    actionCurdStore(app);
    actionCrudProduct(app);

    actionViewRecords(app);
    actionCrudRecord(app);
};
