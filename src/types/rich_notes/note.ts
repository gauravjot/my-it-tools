export type NoteListItemType = {
	id: string;
	user: string;
	title: string;
	created: string;
	updated: string;
};

export type NoteListType = NoteListItemType[];

export type SharedNoteType = {
	noteTitle: string;
	noteContent: string;
	noteSharedBy: string;
	noteSharedByUID: string;
	noteSharedOn: string;
	noteCreated: string;
	noteUpdated: string;
};
