interface Props {
	size: "xs" | "sm" | "md" | "lg" | "xl";
	color: "white" | "black" | "gray" | "primary" | "danger";
}

/**
 * @description Spinner component
 * @param {"xs" | "sm" | "md" | "lg" | "xl"} size
 * @param {"white" | "black" | "gray" | "primary"} color
 */
export default function Spinner(props: Props) {
	const styles = "spinner spinner-" + props.size + " spinner-" + props.color;

	return <span className={styles}></span>;
}
