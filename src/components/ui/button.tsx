import * as React from "react";
import {Slot} from "@radix-ui/react-slot";
import {cva, type VariantProps} from "class-variance-authority";

import {cn} from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				accent: "bg-accent-600 text-white hover:bg-accent-600/90",
				secondary: "bg-secondary text-secondary-foreground hover:bg-muted-foreground/20",
				destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline:
					"border border-input hover:border-muted-foreground bg-background hover:bg-card hover:text-foreground",
				accentOutline: "border border-accent-600 text-accent-foreground hover:bg-accent-600/90",
				secondaryOutline: "border border-secondary text-secondary-foreground hover:bg-secondary/90",
				destructiveOutline:
					"border border-destructive text-destructive-foreground hover:bg-destructive/90",
				ghost: "hover:bg-foreground/20 text-foreground",
				accentGhost: "hover:bg-accent-600/20 text-accent",
				secondaryGhost: "hover:bg-secondary/20 text-secondary",
				destructiveGhost: "hover:bg-destructive/20 text-destructive",
				link: "text-primary underline-offset-4 hover:underline",
				accentLink: "text-accent-600 underline-offset-4 hover:underline",
				secondaryLink: "text-secondary underline-offset-4 hover:underline",
				destructiveLink: "text-destructive underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({className, variant, size, asChild = false, ...props}, ref) => {
		const Comp = asChild ? Slot : "button";
		return <Comp className={cn(buttonVariants({variant, size, className}))} ref={ref} {...props} />;
	}
);
Button.displayName = "Button";

export {Button, buttonVariants};
