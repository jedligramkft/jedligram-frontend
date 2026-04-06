import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import DynamicFAIcon from "../Utils/DynamicFaIcon";
import { GhostButton, PrimaryButton, SecondaryButton } from "../Buttons";

type ConfirmationModalProps = {
	isOpen: boolean;
	title: string;
	description: string;
	cancelText: string;
	confirmText: string;
	onConfirm: () => void | Promise<void>;
	onClose: () => void;
	isConfirmLoading?: boolean;
	cancelButtonClassName?: string;
	confirmButtonClassName?: string;
};

const ConfirmationModal = ({
	isOpen,
	title,
	description,
	cancelText,
	confirmText,
	onConfirm,
	onClose,
	isConfirmLoading = false,
	cancelButtonClassName = "",
	confirmButtonClassName = "",
}: ConfirmationModalProps) => {
	const { t } = useTranslation();

	useEffect(() => {
		if (!isOpen) return;

		const previousBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const onEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};

		window.addEventListener("keydown", onEscape);
		return () => {
			window.removeEventListener("keydown", onEscape);
			document.body.style.overflow = previousBodyOverflow;
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		// createPortal is used to render the modal outside of the normal React component hierarchy, directly into the body element. This helps avoid issues with z-index and positioning that can arise when modals are nested within other components.
		<div
			className="fixed inset-0 z-50 flex min-h-screen w-screen items-center justify-center bg-black/65 px-4 py-6"
			style={{ zIndex: 2147483647 }}
			onClick={onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="confirmation-modal-title"
				className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#1f2226] p-5 text-white shadow-2xl sm:p-6"
				onClick={(event) => event.stopPropagation()}
			>
				<GhostButton
					type="button"
					onClick={onClose}
					className="absolute right-3 top-3 p-3"
					aria-label={t("modal.close_aria_label")}
				>
					<DynamicFAIcon exportName="faX" />
				</GhostButton>

				<h3
					id="confirmation-modal-title"
					className="pr-8 text-xl font-bold"
				>
					{title}
				</h3>
				<p className="mt-3 text-sm text-white/75 whitespace-pre-line">
					{description}
				</p>

				<div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
					<PrimaryButton
						type="button"
						onClick={onConfirm}
						disabled={isConfirmLoading}
						className={`w-full px-4 py-2 ${confirmButtonClassName}`}
					>
						{isConfirmLoading ? (
							<span className="flex items-center gap-2">
								<DynamicFAIcon
									exportName="faSpinner"
									className="animate-spin"
								/>
								{t("modal.in_progress")}
							</span>
						) : (
							<span>{confirmText}</span>
						)}
					</PrimaryButton>
					<SecondaryButton
						type="button"
						onClick={onClose}
						disabled={isConfirmLoading}
						className={`w-full px-4 py-2 ${cancelButtonClassName}`}
					>
						{cancelText}
					</SecondaryButton>
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default ConfirmationModal;
