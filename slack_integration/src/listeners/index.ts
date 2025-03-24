import { App } from '@slack/bolt';
import { register as registerAppHomeOpened } from './app_home_opened';
import { register as registerAppHomeManageMaster } from './app_home_manage_master';

export const registerListeners = (app: App): void => {
    registerAppHomeOpened(app);
    registerAppHomeManageMaster(app);
}
