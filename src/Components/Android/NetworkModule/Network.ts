import { useEffect, useState } from "react";
import { Network, type ConnectionStatus } from "@capacitor/network";
import type { PluginListenerHandle } from "@capacitor/core";

const defaultNetworkStatus: Readonly<ConnectionStatus> = {
	connected: false,
	connectionType: "unknown",
};

let currentNetworkStatus: ConnectionStatus = defaultNetworkStatus;

const getCurrentNetworkStatus = () => currentNetworkStatus;

const subscribeToNetworkStatus = async (
	callback: (status: ConnectionStatus) => void,
): Promise<() => Promise<void>> => {
	const listener: PluginListenerHandle = await Network.addListener(
		"networkStatusChange",
		(status) => {
			console.log("Network status changed", status);
			currentNetworkStatus = status;
			callback(status);
		},
	);

	return () => listener.remove();
};

const useNetworkStatus = () => {
	const [networkStatus, setNetworkStatus] =
		useState<ConnectionStatus>(defaultNetworkStatus);

	useEffect(() => {
		let unsubscribe: (() => Promise<void>) | null = null;

		const setup = async () => {
			// initial status
			const status = await Network.getStatus();
			currentNetworkStatus = status;
			setNetworkStatus(status);

			// subscribe to changes
			unsubscribe = await subscribeToNetworkStatus((newStatus) => {
				setNetworkStatus(newStatus);
			});
		};

		void setup();

		return () => {
			if (unsubscribe) {
				void unsubscribe();
			}
		};
	}, []);

	return networkStatus;
};

export {
	useNetworkStatus,
	subscribeToNetworkStatus,
	getCurrentNetworkStatus,
	defaultNetworkStatus,
};
