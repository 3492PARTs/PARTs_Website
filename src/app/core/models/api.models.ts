export enum APIStatus {
    prcs = 'prcs',
    on = 'on',
    off = 'off'
}

export interface IBanner {
    id: number;
    severity: number; // 1 - high, 2 - med, 3 - low (Still needs implemented)
    message: string; //
    time: number; // time in ms to show banner, 0 means until dismissed
    timeout: number | null | undefined;
    dismissed: boolean;
    fn: () => void;
}

export class Banner implements IBanner {
    id = 0;
    severity!: number; // 1 - high, 2 - med, 3 - low (Still needs implemented)
    message!: string; //
    time = -1; // time in ms to show banner, 0 means until dismissed
    timeout: number | null | undefined;
    dismissed = false;
    fn = () => { };

    constructor(id = 0, message = '', time = -1, severity = 3, fn = () => { }) {
        this.id = id;
        this.message = message;
        this.time = time;
        this.severity = severity;
        this.fn = fn;
    }
}