import {Board, Card, CardStatus} from "@/types/kanban";
import {create} from "zustand";
import {subscribeWithSelector} from "zustand/middleware";

export interface KanbanStateType {
	currentBoard: Board | null;
	setCurrentBoard: (board: Board | null) => void;

	// functions
	openBoard: (boardId: string) => void;
	closeBoard: () => void;
	openCard: (board: Board, cardId: string) => Card | null;
	updateCard: (board: Board, cardId: string, updatedCard: Partial<Card>) => boolean;
}

export const useKanbanStateStore = create<KanbanStateType>()(
	subscribeWithSelector((set) => ({
		currentBoard: null,
		setCurrentBoard: (board) => set({currentBoard: board}),
		/*


		*/
		openBoard: (boardId) => {
			// Fetch the board data from an API or local storage based on the boardId
			// For demonstration, we'll create a mock board
			const mockCardStatus: CardStatus = {color: "blue", label: "To Do", isCompleted: false};
			const mockBoard: Board = {
				id: boardId,
				label: "Sample Board",
				cards: [
					{
						id: "1",
						label: "Card 1",
						description: "This is card 1",
						sortOrder: 1,
						status: mockCardStatus,
					},
					{
						id: "2",
						label: "Card 2",
						description: "This is card 2",
						sortOrder: 2,
						status: mockCardStatus,
					},
				],
			};
			set({currentBoard: mockBoard});
		},
		closeBoard: () => set({currentBoard: null}),
		openCard: (board, cardId) => {
			const card = board.cards.find((c) => c.id === cardId);
			return card || null;
		},
		updateCard: (board, cardId, updatedCard) => {
			const cardIndex = board.cards.findIndex((c) => c.id === cardId);
			if (cardIndex === -1) return false;

			board.cards[cardIndex] = {...board.cards[cardIndex], ...updatedCard};
			set({currentBoard: {...board}});
			return true;
		},
	}))
);
