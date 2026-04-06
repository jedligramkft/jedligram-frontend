import ButtonBase, { type AppButtonProps } from "./ButtonBase";

const PRIMARY_BUTTON_CLASSNAME = `inline-flex cursor-pointer items-center justify-center rounded-xl  px-4 py-2 text-sm font-semibold transition 
    bg-gradient-to-tr from-violet-700 via-blue-500 to-cyan-600 text-white shadow-lg
    hover:from-violet-600 hover:via-blue-600 hover:to-cyan-700 
    active:from-violet-800 active:via-blue-700 active:to-cyan-800 active:scale-[98%]
    disabled:cursor-not-allowed disabled:opacity-60`;

const PrimaryButton = ({ className, ...props }: AppButtonProps) => {
	return (
		<ButtonBase
			defaultClassName={PRIMARY_BUTTON_CLASSNAME}
			className={className}
			{...props}
		/>
	);
};

export default PrimaryButton;
