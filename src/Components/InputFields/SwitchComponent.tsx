import React from "react";
import { useTranslation } from "react-i18next";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import DynamicFAIcon from "../Utils/DynamicFaIcon";

// Switch component:
// - supports controlled (`checked` prop provided) and uncontrolled
//   (internal state) use
// - renders optional icon, title/subtitle, and an accessible switch button
//   with `role="switch"` and `aria-checked`

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
	const { t } = useTranslation();

	// Support both controlled and uncontrolled usage from parent components.
	// When `checked` is provided the parent controls the visual state and
	// this component will only notify changes via `onChange` (it won't
	// locally flip the UI). When `checked` is undefined the component is
	// uncontrolled and keeps its own internal state.
	const isControlled = checked !== undefined;
	const [internalChecked, setInternalChecked] = React.useState(
		Boolean(checked),
	);
	const isChecked = isControlled ? Boolean(checked) : internalChecked;

	// Sync internal state with `checked` when controlled so internalChecked
	// reflects the latest prop value. This keeps initial and transitional
	// values consistent if the component is reused in different modes.
	React.useEffect(() => {
		if (isControlled) {
			setInternalChecked(Boolean(checked));
		}
	}, [isControlled, checked]);

	const toggleSwitch = () => {
		const newState = !isChecked;
		// In uncontrolled mode update internal state so the UI updates
		// immediately. In controlled mode do NOT update local state — only
		// notify the parent and let it pass a new `checked` prop.
		if (!isControlled) {
			setInternalChecked(newState);
		}
		// Always emit change so parent can respond.
		onChange?.(newState);
	};

	// Provide a stable id for the button for accessibility. `useId()` is
	// preferred; fall back to a readable string when not available.
	const switchId = React.useId() ?? `switch-${title}-${subtitle}`;

	return (
		<div
			className={`h-fit flex items-center gap-4 ${containerClass ?? ""}`}
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
				<div className="w-full h-full space-y-0.5">
					{title ? (
						<p
							className={`max-w-full md:max-w-[80%] wrap-break-word text-sm md:text-base font-medium text-white/90 ${titleClass ?? ""}`}
						>
							{title}
						</p>
					) : null}
					{subtitle ? (
						<p
							className={`max-w-full md:max-w-[80%] wrap-break-word text-xs md:text-sm leading-4 text-neutral-400 ${subtitleClass ?? ""}`}
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
					aria-label={title ?? t("switch.toggle_aria_label")}
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
						{/* Thumb icon shows current state. DynamicFAIcon expects the
						   FontAwesome export name (e.g. "faCheck" / "faXmark"). */}
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
