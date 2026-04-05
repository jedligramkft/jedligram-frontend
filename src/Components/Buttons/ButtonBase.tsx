import type { ButtonHTMLAttributes, MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";

export type AppButtonProps = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	"className" | "disabled" | "onClick"
> & {
	className?: string;
	disabled?: boolean;
	onClick?: MouseEventHandler<HTMLButtonElement>;
};

type ButtonBaseProps = AppButtonProps & {
	defaultClassName: string;
};

const buildButtonClassName = (defaultClassName: string, className?: string) => {
	return twMerge(defaultClassName, className);
};

const ButtonBase = ({
	defaultClassName,
	className,
	type = "button",
	...props
}: ButtonBaseProps) => {
	return (
		<button
			type={type}
			className={buildButtonClassName(defaultClassName, className)}
			{...props}
		/>
	);
};

export default ButtonBase;
