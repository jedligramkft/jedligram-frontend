import { useEffect, useRef } from "react";

interface ScreenLoaderProps {
	callback?: () => Promise<void> | void;
	delayMs?: number;
}

const ScreenLoader = ({ callback, delayMs = 350 }: ScreenLoaderProps) => {
	const loaderRef = useRef<HTMLDivElement | null>(null);
	const callbackRef = useRef(callback);
	const isRequestInFlightRef = useRef(false);
	const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const checkVisibility = () => {
			const loaderElement = loaderRef.current;
			if (!loaderElement) {
				return;
			}

			const rect = loaderElement.getBoundingClientRect();
			const isVisible =
				rect.bottom > 0 &&
				rect.right > 0 &&
				rect.top < window.innerHeight &&
				rect.left < window.innerWidth;

			if (isVisible) {
				void triggerLoad();
			}
		};

		const triggerLoad = async () => {
			if (isRequestInFlightRef.current) {
				return;
			}

			// Lock immediately so repeated scroll events cannot queue overlapping requests.
			isRequestInFlightRef.current = true;
			try {
				await callbackRef.current?.();
			} finally {
				if (unlockTimeoutRef.current) {
					clearTimeout(unlockTimeoutRef.current);
				}

				// Brief cooldown smooths out bursty callbacks; then recheck if loader is still visible.
				unlockTimeoutRef.current = setTimeout(() => {
					isRequestInFlightRef.current = false;
					checkVisibility();
				}, delayMs);
			}
		};

		checkVisibility();
		document.addEventListener("scroll", checkVisibility, {
			passive: true,
			capture: true,
		});
		window.addEventListener("resize", checkVisibility);

		return () => {
			document.removeEventListener("scroll", checkVisibility, true);
			window.removeEventListener("resize", checkVisibility);
			if (unlockTimeoutRef.current) {
				clearTimeout(unlockTimeoutRef.current);
			}
		};
	}, [delayMs]);

	return <div ref={loaderRef} className="w-20 h-1 absolute bottom-96"></div>;
};

export default ScreenLoader;
