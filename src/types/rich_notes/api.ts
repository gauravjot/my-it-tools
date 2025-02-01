export interface NoteType {
	id: string;
	user: string;
	title: string;
	content: string;
	created: string;
	updated: string;
}

export interface ShareNote {
	id: string;
	title: string;
	created: string;
	anonymous: boolean;
	active: boolean;
	isPasswordProtected: boolean;
}
