import type {Preview} from "@storybook/react";
import "../src/assets/styles/global.css";
import "../src/assets/styles/icons.css";

const preview: Preview = {
	parameters: {
		actions: {argTypesRegex: "^on[A-Z].*"},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
	},
};

export default preview;
