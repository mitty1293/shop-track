import { App } from '@slack/bolt';
import { register as registerAppHomeOpened } from './app_home_opened';

export const registerListeners = (app: App): void => {
    registerAppHomeOpened(app);
}
