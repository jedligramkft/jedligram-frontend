import { useEffect } from "react";
import { createPortal } from "react-dom";
import DynamicFAIcon from "../Utils/DynamicFaIcon";

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
	cancelButtonClassName = "border border-white/20 bg-transparent text-white/90 hover:bg-white/10 disabled:opacity-60",
	confirmButtonClassName = "bg-red-600 hover:bg-red-500 disabled:opacity-75",
}: ConfirmationModalProps) => {
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
				<button
					type="button"
					onClick={onClose}
					className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/75 transition hover:bg-white/15 hover:text-white"
					aria-label="Bezárás"
				>
					<DynamicFAIcon exportName="faX" />
				</button>

				<h3
					id="confirmation-modal-title"
					className="pr-8 text-xl font-bold"
				>
					{title}
				</h3>
				<p className="mt-3 text-sm text-white/75 whitespace-pre-line">
					{description}
				</p>

				<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onClose}
						disabled={isConfirmLoading}
						className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed sm:w-auto ${cancelButtonClassName}`}
					>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isConfirmLoading}
						className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-wait sm:w-auto ${confirmButtonClassName}`}
					>
						{isConfirmLoading ? (
							<span className="flex items-center gap-2">
								<DynamicFAIcon
									exportName="faSpinner"
									className="animate-spin"
								/>
								Folyamatban...
							</span>
						) : (
							<span>{confirmText}</span>
						)}
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
};

export default ConfirmationModal;
