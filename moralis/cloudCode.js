const logger = Moralis.Cloud.getLogger();

// Main Token  https://testnet.bscscan.com/address/0x784cb74865fde16039aca9f42bf998cf3c15319d
// Main Bridge https://testnet.bscscan.com/address/0x40390687c960b01cbd670fd8c7a7b5c82f10b776
// Side Token  https://mumbai.polygonscan.com/address/0x784cb74865fde16039aca9f42bf998cf3c15319d
// Side Bridge https://mumbai.polygonscan.com/address/0x40390687c960b01cbd670fd8c7a7b5c82f10b776
// Gateway 0xbcC581C54ebfEB83595B11d70faa14f5FECe2276

// ====================== Testnet ============================================
const web3Main = Moralis.web3ByChain("0x61"); // BSC Testnet - mainnet= 0x38
const web3Side = Moralis.web3ByChain("0x13881"); // Polygon (Mumbai) Testnet - mainnet = 0x89
// ====================== Testnet ============================================

const MainBridge_address = "0x40390687c960b01cbd670fd8c7a7b5c82f10b776";
const SideBridge_address = "0x40390687c960b01cbd670fd8c7a7b5c82f10b776";

const mainToken_address = "0x784cb74865fde16039aca9f42bf998cf3c15319d";
const childToken_address = "0x784cb74865fde16039aca9f42bf998cf3c15319d";

const gateway_address = "0xbcC581C54ebfEB83595B11d70faa14f5FECe2276";
const MainBridge_abi = '[{"inputs":[{"internalType":"address","name":"_mainToken","type":"address"},{"internalType":"address","name":"_gateway","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":true,"internalType":"bytes32","name":"mainDepositHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TokensLocked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":true,"internalType":"bytes32","name":"sideDepositHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TokensUnlocked","type":"event"},{"inputs":[],"name":"gateway","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_bridgedAmount","type":"uint256"},{"internalType":"bytes32","name":"_mainDepositHash","type":"bytes32"}],"name":"lockTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_newGateway","type":"address"}],"name":"setGateway","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_bridgedAmount","type":"uint256"},{"internalType":"bytes32","name":"_sideDepositHash","type":"bytes32"}],"name":"unlockTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawEthToOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawTokenToOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]';
const SideBridge_abi = '[{"inputs":[{"internalType":"address","name":"_gateway","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"BridgeInitialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":true,"internalType":"bytes32","name":"mainDepositHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TokensBridged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"requester","type":"address"},{"indexed":true,"internalType":"bytes32","name":"sideDepositHash","type":"bytes32"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"TokensReturned","type":"event"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_bridgedAmount","type":"uint256"},{"internalType":"bytes32","name":"_mainDepositHash","type":"bytes32"}],"name":"bridgeTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"gateway","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_childTokenAddress","type":"address"}],"name":"initializeBridge","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_requester","type":"address"},{"internalType":"uint256","name":"_bridgedAmount","type":"uint256"},{"internalType":"bytes32","name":"_sideDepositHash","type":"bytes32"}],"name":"returnTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newGateway","type":"address"}],"name":"setGateway","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
const MainBridge = new web3Main.eth.Contract(JSON.parse(MainBridge_abi),MainBridge_address);
const SideBridge = new web3Side.eth.Contract(JSON.parse(SideBridge_abi),SideBridge_address);

Moralis.Cloud.afterSave("BscTokenTransfers", (request) => {
    const data = JSON.parse(JSON.stringify(request.object, ["token_address", "to_address", "from_address","transaction_hash","value", "confirmed"]));
    logger.info(data);
    if (data["token_address"] == mainToken_address.toLocaleLowerCase() 
        && data["to_address"] == MainBridge_address.toLocaleLowerCase() 
        && data["confirmed"]
        && data["from_address"] !== MainBridge_address.toLocaleLowerCase() // bridge can send itself fees for gas
    ) {
        const txlock = processBridgeRequestLock(data);
        const txbridge = processBridgeRequestBridge(data);
    }
    else{
        logger.info("transaction not related to bridge");
    }
    async function processBridgeRequestLock(data) {
        logger.info("bridging starting locking tokens");
        logger.info(data);
        const functionCall = MainBridge.methods.lockTokens(data["from_address"],data["value"],data["transaction_hash"]).encodeABI();
        const gatewayNonce = web3Main.eth.getTransactionCount(gateway_address);
        const transactionBody = {
            to: MainBridge_address,
            nonce:gatewayNonce,
            data:functionCall,
            gas:400000,
            gasPrice:web3Main.utils.toWei("2", "gwei")
        }
		const config = await Moralis.Config.get({useMasterKey: true});
		const GATEWAY_KEY = config.get("GATEWAY_KEY");
      
        signedTransaction = await web3Main.eth.accounts.signTransaction(transactionBody,GATEWAY_KEY);
        logger.info(signedTransaction.transactionHash);
        fulfillTx = await web3Main.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        logger.info("fulfillTx: " + JSON.stringify(fulfillTx));
    }
    async function processBridgeRequestBridge(data) {
        logger.info("bridging tokens");
        const functionCall = SideBridge.methods.bridgeTokens(data["from_address"],data["value"],data["transaction_hash"]).encodeABI();
        const gatewayNonce = web3Side.eth.getTransactionCount(gateway_address);
        const transactionBody = {
            to: SideBridge_address,
              nonce:gatewayNonce,
              data:functionCall,
              gas:400000,
              gasPrice:web3Side.utils.toWei("2", "gwei")
        }
		const config = await Moralis.Config.get({useMasterKey: true});
		const GATEWAY_KEY = config.get("GATEWAY_KEY");
      
        signedTransaction = await web3Side.eth.accounts.signTransaction(transactionBody,GATEWAY_KEY);
        logger.info(signedTransaction.transactionHash);
        fulfillTx = await web3Side.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        logger.info("fulfillTx: " + JSON.stringify(fulfillTx))
        return fulfillTx;
    }
});


Moralis.Cloud.afterSave("EthTokenTransfers", (request) => {
    const data = JSON.parse(JSON.stringify(request.object, ["token_address", "to_address", "from_address","transaction_hash","value", "confirmed"]));
    logger.info(data);
    if (data["token_address"] == childToken_address.toLocaleLowerCase() 
        && data["to_address"] == SideBridge_address.toLocaleLowerCase() 
        && data["confirmed"]
        && data["from_address"] !== '0x0000000000000000000000000000000000000000' // mints can go to bridge
    ) {
        const txlock = processReturnBurn(data);
        const txbridge = processReturnUnlock(data);
    }
    else{
        logger.info("transaction not related to bridge");
    }
    async function processReturnBurn(data) {
        logger.info("returning tokens burning");
        const functionCall = SideBridge.methods.returnTokens(data["from_address"],data["value"],data["transaction_hash"]).encodeABI();
        const gatewayNonce = web3Side.eth.getTransactionCount(gateway_address);
        const transactionBody = {
            to: SideBridge_address,
              nonce:gatewayNonce,
              data:functionCall,
              gas:400000,
              gasPrice:web3Side.utils.toWei("2", "gwei")
        }
 		const config = await Moralis.Config.get({useMasterKey: true});
		const GATEWAY_KEY = config.get("GATEWAY_KEY");
      
        signedTransaction = await web3Side.eth.accounts.signTransaction(transactionBody,GATEWAY_KEY);
        logger.info(signedTransaction.transactionHash);
        fulfillTx = await web3Side.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        logger.info("fulfillTx: " + JSON.stringify(fulfillTx))
        return fulfillTx;
    }
    async function processReturnUnlock(data) {
        logger.info("returning starting unlocking tokens");
        const functionCall = MainBridge.methods.unlockTokens(data["from_address"],data["value"],data["transaction_hash"]).encodeABI();
        const gatewayNonce = web3Main.eth.getTransactionCount(gateway_address);
        const transactionBody = {
            to: MainBridge_address,
              nonce:gatewayNonce,
              data:functionCall,
              gas:400000,
              gasPrice:web3Main.utils.toWei("2", "gwei")
        }
  		const config = await Moralis.Config.get({useMasterKey: true});
		const GATEWAY_KEY = config.get("GATEWAY_KEY");
      
        signedTransaction = await web3Main.eth.accounts.signTransaction(transactionBody,GATEWAY_KEY);
        logger.info(signedTransaction.transactionHash);
        fulfillTx = await web3Main.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        logger.info("fulfillTx: " + JSON.stringify(fulfillTx));
    }
});