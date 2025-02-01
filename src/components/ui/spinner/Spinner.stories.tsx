// Spinner.stories.ts|tsx

import type {Meta, StoryObj} from "@storybook/react";
import Spinner from "./Spinner";

const meta: Meta<typeof Spinner> = {
	component: Spinner,
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Storybook: Story = {
	argTypes: {
		size: {
			options: ["sm", "md", "lg", "xl"],
			control: {type: "radio"},
		},
		color: {
			options: ["white", "black", "gray", "primary", "danger"],
			control: {type: "radio"},
		},
	},
	args: {
		size: "sm",
		color: "primary",
	},
	render: ({...args}) => <Spinner {...args} />,
};
