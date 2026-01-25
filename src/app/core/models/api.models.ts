export enum APIStatus {
    prcs = 'prcs',
    on = 'on',
    off = 'off'
}

export interface IBanner {
    severity: number; // 1 - high, 2 - med, 3 - low (Still needs implemented)
    message: string; //
    time: number; // time in ms to show banner, 0 means until dismissed
    timeout: number | undefined;
    dismissed: boolean;
    fn: () => void;
}

export class Banner implements IBanner {
    severity!: number; // 1 - high, 2 - med, 3 - low (Still needs implemented)
    message!: string; //
    time = -1; // time in ms to show banner, 0 means until dismissed
    timeout: number | undefined;
    dismissed = false;
    fn = () => { };

    constructor(message = '', time = -1, severity = 3, fn = () => { }) {
        this.message = message;
        this.time = time;
        this.severity = severity;
        this.fn = fn;
    }
}

export interface ISiteBanner {
    id: string;
    message: string; //
    time: number; // time in ms to show banner, 0 means until dismissed
    timeout: number | null | undefined;
    dismissed: boolean;
}

export class SiteBanner implements ISiteBanner {
    id = '';
    message!: string; //
    time = -1; // time in ms to show banner, 0 means until dismissed
    timeout: number | null | undefined;
    dismissed = false;

    constructor(id = '', message = '', time = -1) {
        this.id = id;
        this.message = message;
        this.time = time;
    }
}