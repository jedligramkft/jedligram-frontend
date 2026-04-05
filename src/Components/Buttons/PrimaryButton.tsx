import ButtonBase, { type AppButtonProps } from "./ButtonBase";

const PRIMARY_BUTTON_CLASSNAME =
	"inline-flex cursor-pointer items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white keep-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60";

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
