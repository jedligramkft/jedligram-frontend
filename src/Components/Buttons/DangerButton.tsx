import ButtonBase, { type AppButtonProps } from "./ButtonBase";

const DANGER_BUTTON_CLASSNAME = `inline-flex cursor-pointer items-center 
	justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white
	keep-white transition border border-red-500/30 bg-red-500/10 hover:bg-red-500/20`;

const DangerButton = ({ className, ...props }: AppButtonProps) => {
	return (
		<ButtonBase
			defaultClassName={DANGER_BUTTON_CLASSNAME}
			className={className}
			{...props}
		/>
	);
};

export default DangerButton;
