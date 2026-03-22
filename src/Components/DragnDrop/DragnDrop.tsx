import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

interface DragnDropProps {
	onFileSelected: (file: File) => void | Promise<void>;
	isUploading?: boolean;
	accept?: string;
	acceptedMimeTypes?: string[];
	maxFileSizeBytes?: number;
	title?: string;
	description?: string;
	selectButtonLabel?: string;
	uploadingLabel?: string;
	className?: string;
	onValidationError?: (message: string | null) => void;
}

const defaultAcceptedMimeTypes = [
	"image/jpeg",
	"image/png",
	"image/jpg",
	"image/gif",
];

const defaultAccept = ".jpeg,.jpg,.png,.gif";
const defaultMaxFileSizeBytes = 2 * 1024 * 1024;

export const DragnDrop = ({
	onFileSelected,
	isUploading = false,
	accept = defaultAccept,
	acceptedMimeTypes = defaultAcceptedMimeTypes,
	maxFileSizeBytes = defaultMaxFileSizeBytes,
	title = "Huzd ide a fajlt",
	description = "Elfogadott formatumok: JPEG, JPG, PNG, GIF • Maximum meret: 2MB",
	selectButtonLabel = "Fajl kivalasztasa",
	uploadingLabel = "Feltoltes...",
	className = "",
	onValidationError,
}: DragnDropProps) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const setValidationError = (message: string | null) => {
		setErrorMessage(message);
		onValidationError?.(message);
	};

	const validateFile = (file: File): string | null => {
		if (!acceptedMimeTypes.includes(file.type)) {
			return "Csak JPEG, JPG, PNG vagy GIF fajl toltheto fel.";
		}

		if (file.size > maxFileSizeBytes) {
			return "A fajl merete nem lehet nagyobb 2MB-nal.";
		}

		return null;
	};

	const processFile = async (file: File) => {
		const validationError = validateFile(file);
		if (validationError) {
			setValidationError(validationError);
			return;
		}

		setValidationError(null);
		await onFileSelected(file);
	};

	const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		void processFile(file).finally(() => {
			if (fileInputRef.current) fileInputRef.current.value = "";
		});
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(false);

		const file = e.dataTransfer.files?.[0];
		if (!file) return;

		void processFile(file);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = () => {
		setIsDragOver(false);
	};

	return (
		<div className={className}>
			<input
				ref={fileInputRef}
				type="file"
				accept={accept}
				className="hidden"
				onChange={handleFileInputChange}
			/>
			<div
				className={`rounded-xl border-2 border-dashed p-6 text-center transition ${isDragOver ? "border-blue-400 bg-blue-500/10" : "border-gray-500/70 bg-white/5"}`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
			>
				<p className="text-sm font-semibold text-white">{title}</p>
				<p className="mt-2 text-xs text-gray-400">{description}</p>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
					className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
				>
					{isUploading ? uploadingLabel : selectButtonLabel}
				</button>
			</div>
			{errorMessage ? (
				<p className="mt-2 text-sm text-red-400">{errorMessage}</p>
			) : null}
		</div>
	);
};
