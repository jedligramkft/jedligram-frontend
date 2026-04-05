import ButtonBase, { type AppButtonProps } from "./ButtonBase";

const SECONDARY_BUTTON_CLASSNAME =
	"inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-400/25 bg-gray-600/35 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-gray-600/80 disabled:cursor-not-allowed disabled:opacity-60";

const SecondaryButton = ({ className, ...props }: AppButtonProps) => {
	return (
		<ButtonBase
			defaultClassName={SECONDARY_BUTTON_CLASSNAME}
			className={className}
			{...props}
		/>
	);
};

export default SecondaryButton;
