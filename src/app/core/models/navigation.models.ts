import { IAuthPermission, AuthPermission } from "@app/auth/models/user.models";

export interface ISubLink {
    id: number;
    menu_name: string;
    menu_name_active_item: string;
    menu_header: string;
    order: number;
    permission: IAuthPermission | null;
    routerlink: string;
    icon: string;
}

export class SubLink implements ISubLink {
    id = NaN;
    menu_name = '';
    menu_name_active_item = '';
    menu_header = '';
    order = -1;
    permission!: AuthPermission | null;
    routerlink = '';
    icon = 'clipboard-text-multiple-outline';

    constructor(menu_name: string, routerlink: string, icon?: string, menu_header?: string) {
        this.menu_name = menu_name;
        this.routerlink = routerlink;
        this.icon = icon || 'clipboard-text-multiple-outline';
        this.menu_header = menu_header || '';
    }
}

export interface ILink {
    id: number;
    menu_name: string;
    menu_name_active_item: string;
    menu_header: string;
    order: number;
    permission: IAuthPermission | null;
    routerlink: string;
    icon: string;
    menu_items: ISubLink[];

}

export class Link implements ILink {
    id = NaN;
    menu_name = '';
    menu_name_active_item = '';
    menu_header = '';
    order = -1;
    permission!: AuthPermission | null;
    routerlink = '';
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