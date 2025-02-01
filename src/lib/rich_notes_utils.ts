export const ExampleDocument: SlateNodeType[] = [
	{
		type: "paragraph",
		children: [
			{
				text: "",
			},
		],
	},
];

export interface SlateNodeType {
	type: string;
	children: {
		text: string;
	}[];
}

export type SlateDocumentType = ReturnType<typeof Array<SlateNodeType>>;
