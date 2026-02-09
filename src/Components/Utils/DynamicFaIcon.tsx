"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export default function DynamicFAIcon({
	exportName,
	size,
	className,
}: {
	exportName: string;
	size?:
		| "lg"
		| "xs"
		| "sm"
		| "1x"
		| "2x"
		| "3x"
		| "4x"
		| "5x"
		| "6x"
		| "7x"
		| "8x"
		| "9x"
		| "10x";
	className?: string;
}) {
	const [icon, setIcon] = useState<IconDefinition | null>(null);
	// console.log("Dynamically imported icon:", exportName);

	useEffect(() => {
		let mounted = true;
		import("@fortawesome/free-solid-svg-icons").then((mod) => {
			//   console.log("Available keys in module:", Object.keys(mod));
			const modTyped = mod as unknown as Record<
				string,
				IconDefinition | undefined
			>;
			const found = modTyped[exportName];
			if (mounted && found) setIcon(found);
		});
		return () => {
			mounted = false;
		};
	}, [exportName]);

	if (!icon) return null;
	return <FontAwesomeIcon icon={icon} size={size} className={className} />;
}
