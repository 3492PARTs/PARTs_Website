import { User } from "./user.models";

export class Meeting {
    id = NaN;
    start = new Date();
    end: Date | undefined = undefined;
    title = '';
    description = '';
}

export class Attendance {
    id = NaN;
    user = new User();
    time_in = new Date();
    time_out: Date | undefined = undefined;
    bonus_approved = false;
    meeting: Meeting | undefined = undefined;
}