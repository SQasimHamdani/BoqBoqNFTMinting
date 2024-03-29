import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';

const RPC_URLS = {
	1: 'https://mainnet.infura.io/v3/579384f3775a49519fe8fa456fd1ded3',
	2: "https://eth-goerli.alchemyapi.io/v2/rn4UXbjwp3vFHrRH6-w-sbM96jDnf5VI",
	3: "https://rinkeby.infura.io/v3/579384f3775a49519fe8fa456fd1ded3",
};

//metamask
export const metamaskconnect = new InjectedConnector({
	supportedChainIds: [1]
	// supportedChainIds: [5]
});


export const walletconnect = new WalletConnectConnector({
	rpc: {
		1: RPC_URLS[1]
		// 5: RPC_URLS[2]
	},
	qrcode: true,
	pollingInterval: 15000
});


export function resetWalletConnector(connector) {
	if (connector && connector instanceof WalletConnectConnector) {
		connector.walletConnectProvider = undefined;
	}
}

//coinbase
export const coinbaseconnect = new WalletLinkConnector({
	url: RPC_URLS[1],
	// url: RPC_URLS[2],
	appName: 'Bull Runners',
	supportedChainIds: [1],
	// supportedChainIds: [5],
});