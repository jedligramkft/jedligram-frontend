import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

interface DragnDropProps {
	onFileSelected: (file: File) => void | Promise<void>;
	isUploading?: boolean;
	accept?: string[];
	maxFileSizeBytes?: number;
	title?: string;
	description?: string;
	selectButtonLabel?: string;
	uploadingLabel?: string;
	className?: string;
	onValidationError?: (message: string | null) => void;
}

const defaultAccept = [".jpeg", ".jpg", ".png", ".gif"];
const defaultMaxFileSizeBytes = 2 * 1024 * 1024;

export const DragnDrop = ({
	onFileSelected,
	onValidationError,
	isUploading = false,
	accept = defaultAccept,
	maxFileSizeBytes = defaultMaxFileSizeBytes,
	title = "Húzd ide a fájlt",
	description = "Vagy kattints a gombra a fájl kiválasztásához.",
	selectButtonLabel = "Fájl kiválasztása",
	uploadingLabel = "Feltöltés...",
	className = "",
}: DragnDropProps) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const acceptedMimeTypes = accept.map((ext) => {
		return ext.replace(".", "image/");
	});

	// Keep local and parent validation states in sync.
	const setValidationError = (message: string | null) => {
		setErrorMessage(message);
		onValidationError?.(message);
	};

	// Validate file MIME type and size before calling upload logic.
	// - If `acceptedMimeTypes` contains "*" then any MIME type is accepted.
	// - If `maxFileSizeBytes` is -1 then there is no size limit.
	const validateFile = (file: File): string | null => {
		if (
			!acceptedMimeTypes.includes("*") &&
			!acceptedMimeTypes.includes(file.type)
		) {
			return `Csak ${acceptedMimeTypes.join(", ")} fájl tölthető fel.`;
		}

		if (maxFileSizeBytes !== -1 && file.size > maxFileSizeBytes) {
			return `A fájl mérete nem lehet nagyobb ${maxFileSizeBytes / (1024 * 1024)} MB-nál.`;
		}

		return null;
	};

	// Shared file processing path for both input selection and drag-drop.
	const processFile = async (file: File) => {
		const validationError = validateFile(file);
		if (validationError) {
			setValidationError(validationError);
			return;
		}

		setValidationError(null);
		await onFileSelected(file);
	};

	// Handle native file input and clear it so selecting the same file works again.
	const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		void processFile(file).finally(() => {
			if (fileInputRef.current) fileInputRef.current.value = "";
		});
	};

	// Prevent browser default behavior and process dropped file.
	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(false);

		const file = e.dataTransfer.files?.[0];
		if (!file) return;

		void processFile(file);
	};

	// Mark drop zone as active while file is dragged over it.
	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	// Reset drop zone visual state when drag leaves the area.
	const handleDragLeave = () => {
		setIsDragOver(false);
	};

	return (
		<div className={className}>
			<input
				ref={fileInputRef}
				type="file"
				accept={accept.includes("*") ? undefined : accept.join(",")}
				className="hidden"
				onChange={handleFileInputChange}
			/>
			<div
				className={`rounded-xl border-2 border-dashed p-6 text-center transition ${isDragOver ? "border-blue-400 bg-blue-500/10" : "border-gray-500/70 bg-white/5"}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
			>
				{title && (
					<p className="text-sm font-semibold text-white">{title}</p>
				)}
				{description && (
					<p className="mt-2 text-xs text-gray-400">{description}</p>
				)}
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
					className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
				>
					{isUploading ? uploadingLabel : selectButtonLabel}
				</button>
				<div className="*:text-xs *:text-gray-500 mt-4">
					<p>
						Elfogadott formátumok:{" "}
						{accept.includes("*")
							? "Minden formátum"
							: accept.join(", ")}
					</p>
					<p>
						Maximum fájl méret:{" "}
						{maxFileSizeBytes === -1
							? "Nincs korlátozás"
							: `${maxFileSizeBytes / (1024 * 1024)} MB`}
					</p>
				</div>
			</div>
			{errorMessage ? (
				<p className="mt-2 text-sm text-red-400">{errorMessage}</p>
			) : null}
		</div>
	);
};
