"use client";
import type { ReactNode } from "react";

export const InputComponent = (props: {
	label: string;
	type?: string;
	name?: string;
	value: string;
	placeholder?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	absoluteChildren?: ReactNode;
	inputClassName?: string;
	labelClassName?: string;
	maxLength?: number;
	disabled?: boolean;
	autoComplete?: string;
	ignorePasswordManager?: boolean;
}) => {
	const {
		label,
		type = "text",
		name,
		value,
		placeholder,
		onChange,
		absoluteChildren,
		maxLength,
		disabled,
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
				<input
					name={name ?? label}
					type={type}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					maxLength={maxLength}
					autoComplete={
						autoComplete ??
						(ignorePasswordManager ? "off" : undefined)
					}
					className={`w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-white/20 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/5 disabled:text-white/40 disabled:placeholder:text-white/30 ${props.inputClassName || ""}`}
					disabled={disabled}
					data-bwignore={ignorePasswordManager ? "true" : undefined}
					data-lpignore={ignorePasswordManager ? "true" : undefined}
					data-1p-ignore={ignorePasswordManager ? "true" : undefined}
				/>
				{absoluteChildren}
			</div>
			{maxLength && (
				<p className="text-xs text-gray-500 mt-1">
					{value.length}/{maxLength}
				</p>
			)}
		</div>
	);
};
