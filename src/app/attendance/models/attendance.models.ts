import { User } from "@app/auth/models/user.models";
import { Season } from "@app/scouting/models/scouting.models";

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
    user: User | undefined = undefined;
    time_in = new Date();
    time_out: Date | undefined = undefined;
    absent = false;
    approval_typ = new AttendanceApproval();
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

export class AttendanceApproval {
    approval_typ = 'unapp';
    approval_nm = 'Unapproved';
}