"use client";
import type { ReactNode } from "react";

export const InputComponent = (props: {
	label: string;
	type?: string;
	value: string;
	placeholder?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	absoluteChildren?: ReactNode;
	inputClassName?: string;
	labelClassName?: string;
	maxLength?: number;
}) => {
	const {
		label,
		type = "text",
		value,
		placeholder,
		onChange,
		absoluteChildren,
	} = props;

	return (
		<div>
			<label
				htmlFor={label}
				className={`text-sm font-semibold text-white/70 ml-3 ${props.labelClassName || ""}`}
			>
				{label}
			</label>
			<div className={`${absoluteChildren ? "relative" : "block"}`}>
				<input
					name={label}
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					className={`w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20 ${props.inputClassName || ""}`}
				/>
				{absoluteChildren}
			</div>
		</div>
	);
};
