export interface User {
    id: number;
    username: string;
    last_connect?: string;
    groupid: number;
    group: string,
    isadmin: boolean
}