export interface UserType {
	user: {
		id: string;
		name: string;
		email: string;
		verified: boolean;
		created: string;
		updated: string;
		password_updated: string;
	};
	session: number;
}

export interface UserSessionType {
	id: number;
	user: string;
	expire: number;
	valid: boolean;
	created: string;
	ip: string;
	ua: string;
}
