import ButtonBase, { type AppButtonProps } from "./ButtonBase";

const GHOST_BUTTON_CLASSNAME =
	"inline-flex cursor-pointer items-center justify-center bg-transparent text-sm font-semibold text-white/85 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

const GhostButton = ({ className, ...props }: AppButtonProps) => {
	return (
		<ButtonBase
			defaultClassName={GHOST_BUTTON_CLASSNAME}
			className={className}
			{...props}
		/>
	);
};

export default GhostButton;
