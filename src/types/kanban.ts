export interface Board {
	id: string;
	label: string;
	cards: Card[];
}

export interface Card {
	id: string;
	label: string;
	description: string;
	sortOrder: number;
	status: CardStatus;
}

export interface CardStatus {
	label: string;
	color: string;
	isCompleted: boolean;
}
