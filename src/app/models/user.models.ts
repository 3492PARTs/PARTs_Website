export interface IAuthPermission {
    id: number;
    codename: string;
    content_type: number;
    name: string;
}

export class AuthPermission implements IAuthPermission {
    id!: number;
    codename!: string;
    content_type!: number;
    name!: string;
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
    image: string;
}

export class User implements IUser {
    id!: number;
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
    image = '';
}