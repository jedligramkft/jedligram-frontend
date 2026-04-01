"use client";
import type { ReactNode } from "react";

export const TextAreaComponent = (props: {
	label: string;
	name?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	placeholder?: string;
	absoluteChildren?: ReactNode;
	rows?: number;
	textAreaClassName?: string;
	labelClassName?: string;
	maxLength?: number;
	autoComplete?: string;
	ignorePasswordManager?: boolean;
}) => {
	const {
		label,
		name,
		value,
		placeholder,
		onChange,
		absoluteChildren,
		rows = 2,
		maxLength,
		autoComplete,
		ignorePasswordManager,
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
					name={name ?? label}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					rows={rows}
					maxLength={maxLength}
					autoComplete={
						autoComplete ??
						(ignorePasswordManager ? "off" : undefined)
					}
					className={`w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20 ${props.textAreaClassName || ""}`}
					data-bwignore={ignorePasswordManager ? "true" : undefined}
					data-lpignore={ignorePasswordManager ? "true" : undefined}
					data-1p-ignore={
						ignorePasswordManager ? "true" : undefined
					}
				/>
				{absoluteChildren}
			</div>
			{maxLength && (
				<p className="text-xs text-gray-500">
					{value.length}/{maxLength}
				</p>
			)}
		</div>
	);
};
