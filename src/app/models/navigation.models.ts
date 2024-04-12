export interface ISubUserLinks {
    menu_name: string;
    menu_name_active_item: string;
    menu_header: string;
    order: number;
    permission: number;
    routerlink: string;
    user_links_id: number;
    icon: string;
}

export class SubUserLinks implements ISubUserLinks {
    menu_name = '';
    menu_name_active_item = '';
    menu_header = '';
    order = -1;
    permission = -1;
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

export interface IUserLinks {
    menu_name: string;
    menu_name_active_item: string;
    menu_header: string;
    order: number;
    permission: number;
    routerlink: string;
    user_links_id: number;
    icon: string;
    menu_items: ISubUserLinks[];

}

export class UserLinks implements IUserLinks {
    menu_name = '';
    menu_name_active_item = '';
    menu_header = '';
    order = -1;
    permission = -1;
    routerlink = '';
    user_links_id = -1;
    icon = 'clipboard-text-multiple-outline';
    menu_items: SubUserLinks[] = [];

    constructor(menu_name: string, routerlink: string, icon?: string, menu_items?: UserLinks[], menu_header?: string) {
        this.menu_name = menu_name;
        this.routerlink = routerlink;
        this.icon = icon || 'clipboard-text-multiple-outline';
        this.menu_items = menu_items || [];
        this.menu_header = menu_header || '';
    }
}