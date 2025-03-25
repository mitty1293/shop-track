import { App } from '@slack/bolt';
import { register as registerEventAppHomeOpened } from './event-app-home-opened';
import { register as registerActionManageMasterData } from './action-manage-master-data';
import { register as registerActionAddNewCategory } from './action-add-new-category';
import { register as registerActionEditCategory } from './action-edit-category';
import { register as registerActionDeleteCategory } from './action-delete-category';

export const registerListeners = (app: App): void => {
    registerEventAppHomeOpened(app);
    registerActionManageMasterData(app);
    registerActionAddNewCategory(app);
    registerActionEditCategory(app);
    registerActionDeleteCategory(app);
}
