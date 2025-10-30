import { ILink, Link } from "@app/core/models/navigation.models";

export interface IAuthPermission {
    id: number;
    codename: string;
    content_type: number;
    name: string;
}

export class AuthPermission implements IAuthPermission {
    id = NaN;
    codename = '';
    content_type = NaN;
    name = '';
}

export interface IAuthGroup {
    id: number;
    name: string;
    permissions: IAuthPermission[];
}

export class AuthGroup implements IAuthGroup {
    id!: number;
    name!: string;
    permissions: AuthPermission[] = [];
}

export interface IUser {
    id: number;
    username: string;
    email: string;
    name: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    discord_user_id: string;
    phone: string;
    phone_type: string;
    phone_type_id: number | null;
    groups: IAuthGroup[];
    permissions: IAuthPermission[];
    image: string;
    links: ILink[];
}

export class User implements IUser {
    id: number = NaN;
    username = '';
    email = '';
    name = '';
    first_name = '';
    last_name = '';
    is_active = false;
    discord_user_id = '';
    phone = '';
    phone_type = '';
    phone_type_id!: number | null;
    groups: AuthGroup[] = [];
    permissions: AuthPermission[] = [];
    image = '';
    links: Link[] = []

    get_full_name(): string {
        return `${this.first_name} ${this.last_name}`;
    }
}