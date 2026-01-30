import { User } from "@app/auth/models/user.models";
import { Season } from "@app/scouting/models/scouting.models";

export class MeetingType {
    meeting_typ = 'reg';
    meeting_nm = 'Regular';
}

export class Meeting {
    id = NaN;
    meeting_typ = new MeetingType();
    season = new Season();
    start = new Date();
    end = new Date(new Date().setHours(new Date().getHours() + 1));
    ended = false;
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
    approval_typ = new AttendanceApprovalType();
    meeting: Meeting | undefined = undefined;
    void_ind = 'n';
}

export class AttendanceReport {
    user = new User();
    reg_time = NaN;
    reg_time_percentage = NaN;
    event_time = NaN;
    event_time_percentage = NaN;
}

export class MeetingHours {
    hours = NaN;
    hours_future = NaN;
    bonus_hours = NaN;
    event_hours = NaN;
}

export class AttendanceApprovalType {
    approval_typ = 'unapp';
    approval_nm = 'Unapproved';
}