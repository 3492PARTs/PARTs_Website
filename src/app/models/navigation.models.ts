import { AuthPermission, IAuthPermission } from "./user.models";

export interface ISubLink {
    link_id: number;
    menu_name: string;
    menu_name_active_item: string;
    menu_header: string;
    order: number;
    permission: IAuthPermission;
    routerlink: string;
    user_links_id: number;
    icon: string;
}

export class SubLink implements ISubLink {
    link_id = NaN;
    menu_name = '';
    menu_name_active_item = '';
    menu_header = '';
    order = -1;
    permission!: AuthPermission;
    routerlink = '';
    user_links_id = -1;
    icon = 'clipboard-text-multiple-outline';

    constructor(menu_name: string, routerlink: string, icon?: string, menu_header?: string) {
        this.menu_name = menu_name;
        this.routerlink = routerlink;
        this.icon = icon || 'clipboard-text-multiple-outline';
        this.menu_header = menu_header || '';
    }
}

export interface ILink {
    link_id: number;
    menu_name: string;
    menu_name_active_item: string;
    menu_header: string;
    order: number;
    permission: IAuthPermission;
    routerlink: string;
    user_links_id: number;
    icon: string;
    menu_items: ISubLink[];

}

export class Link implements ILink {
    link_id = NaN;
    menu_name = '';
    menu_name_active_item = '';
    menu_header = '';
    order = -1;
    permission!: AuthPermission;
    routerlink = '';
    user_links_id = -1;
    icon = 'clipboard-text-multiple-outline';
    menu_items: SubLink[] = [];

    constructor(menu_name?: string, routerlink?: string, icon?: string, menu_items?: SubLink[], menu_header?: string) {
        this.menu_name = menu_name || '';
        this.routerlink = routerlink || '';
        this.icon = icon || 'clipboard-text-multiple-outline';
        this.menu_items = menu_items || [];
        this.menu_header = menu_header || '';
    }
}