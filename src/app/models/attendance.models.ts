import { Season } from "./scouting.models";
import { User } from "./user.models";

export class Meeting {
    id = NaN;
    season = new Season();
    start = new Date();
    end = new Date(new Date().setHours(new Date().getHours() + 1));
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
    percentage = NaN;
}

export class MeetingHours {
    hours = NaN;
    bonus_hours = NaN;
}