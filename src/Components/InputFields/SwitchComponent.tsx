"use client";
import React from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import DynamicFAIcon from "../Utils/DynamicFaIcon";

type ButtonProps = {
	title?: string;
	subtitle?: string;
	icon?: string | IconDefinition;

	containerClass?: string;
	titleClass?: string;
	subtitleClass?: string;
	iconClass?: string;
	buttonClass?: string;
};

type SwitchProps = ButtonProps & {
	checked?: boolean;
	onChange?: (checked: boolean) => void;
};

const Switch: React.FC<SwitchProps> = ({
	title,
	subtitle,
	containerClass,
	titleClass,
	subtitleClass,
	iconClass,
	buttonClass,
	icon,
	checked,
	onChange,
}) => {
	const [isChecked, setIsChecked] = React.useState(Boolean(checked));

	React.useEffect(() => {
		if (checked !== undefined) {
			setIsChecked(checked);
		}
	}, [checked]);

	const toggleSwitch = () => {
		const newState = !isChecked;
		setIsChecked(newState);
		onChange?.(newState);
	};

	const switchId = React.useId() ?? `switch-${title}-${subtitle}`;

	return (
		<div
			className={`h-fit flex items-center justify-center gap-4  ${containerClass ?? ""}`}
		>
			{icon && (
				<div
					className={`w-fit h-full flex items-center justify-center pl-2 pr-4 border-r border-white/20 py-4 ${iconClass ?? ""}`}
				>
					<DynamicFAIcon
						exportName={icon.toString()}
						className={iconClass}
						size="lg"
					/>
				</div>
			)}
			{title || subtitle ? (
				<div className="w-full h-full">
					{title ? (
						<p
							className={`max-w-3/4 wrap-break-word font-medium text-white/90 ${titleClass ?? ""}`}
						>
							{title}
						</p>
					) : null}
					{subtitle ? (
						<p
							className={`mt-0.5 max-w-3/4 wrap-break-word text-xs leading-4 text-neutral-400 ${subtitleClass ?? ""}`}
						>
							{subtitle}
						</p>
					) : null}
				</div>
			) : null}
			<div className="h-full flex items-center justify-center">
				<button
					id={switchId}
					type="button"
					role="switch"
					aria-checked={isChecked}
					aria-label={title ?? "Toggle switch"}
					className={`relative flex h-8 w-14 cursor-pointer items-center rounded-full border border-neutral-500 bg-neutral-700 p-1 transition-colors duration-200 ${buttonClass ?? ""}`}
					style={{
						backgroundColor: isChecked
							? "rgba(38, 110, 72, 0.95)"
							: "rgba(64, 68, 75, 0.95)",
					}}
					onClick={toggleSwitch}
				>
					<div
						className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-[12px] font-bold text-neutral-700 shadow transition-transform duration-200 ease-in-out"
						style={{
							transform: isChecked
								? "translateX(24px)"
								: "translateX(0px)",
						}}
					>
						<DynamicFAIcon
							exportName={isChecked ? "faCheck" : "faXmark"}
							size="1x"
							className="text-black"
						/>
					</div>
				</button>
			</div>
		</div>
	);
};

export default Switch;
