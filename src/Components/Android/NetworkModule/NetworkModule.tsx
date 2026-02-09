/*

  Ezzel a modullal lehet lekérdezni a készülék adatait, mint például a gyártó, modell, operációs rendszer verziója, stb.

  Részletes dokumentáció: https://capacitorjs.com/docs/apis/network

  Letöltés: npm install @capacitor/network

  Feltételek:

    - tádá

*/
import { useNetworkStatus } from "./Network";

const NetworkModule = () => {
	const networkStatus = useNetworkStatus(); // Feliratkozás a hálózati állapot változásaira

	return (
		<div>
			<h1>Network Status</h1>
			<pre>{JSON.stringify(networkStatus, null, 2)}</pre>
		</div>
	);
};

export default NetworkModule;
