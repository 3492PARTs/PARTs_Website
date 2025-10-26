import { Season } from "./scouting.models";
import { User } from "./user.models";

export class Meeting {
    id = NaN;
    season = new Season();
    start = new Date();
    end: Date | undefined = undefined;
    title = '';
    description = '';
    bonus = false;
    void_ind = 'n';
}

export class Attendance {
    id = NaN;
    user = new User();
    time_in = new Date();
    time_out: Date | undefined = undefined;
    absent = false;
    approved = false;
    meeting: Meeting | undefined = undefined;
    void_ind = 'n';
}

export class AttendanceReport {
    user = new User();
    time = NaN;
}