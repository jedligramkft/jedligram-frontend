"use client";
import type { ReactNode } from "react";

export const TextAreaComponent = (props: {
	label: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	placeholder?: string;
	absoluteChildren?: ReactNode;
	rows?: number;
	textAreaClassName?: string;
	labelClassName?: string;
}) => {
	const {
		label,
		value,
		placeholder,
		onChange,
		absoluteChildren,
		rows = 2,
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
				<textarea
					name={label}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					rows={rows}
					className={`w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20 ${props.textAreaClassName || ""}`}
				/>
				{absoluteChildren}
			</div>
		</div>
	);
};
