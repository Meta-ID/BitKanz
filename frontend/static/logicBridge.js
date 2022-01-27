const serverUrl = "https://4bous1ow8mq6.usemoralis.com:2053/server";
const appId = "NfdSGtB1uypxKdY0ptyuj0Xdro9ljeuUTrYik5hA";
Moralis.start({ serverUrl, appId }); 

const mainTokenAddress = "0x784cb74865fde16039aca9f42bf998cf3c15319d";
const mainBridgeAddress = "0x40390687c960b01cbd670fd8c7a7b5c82f10b776";
const chain = '0x61'; // '0x4'; // 

let userAccount = ''

// login();
console.log('hi4', Moralis)

async function login(){
    const web3 = await Moralis.Web3.enableWeb3()
    renderBridgeData();
    subscribeUpdateBridged();
    const chainIdHex = await Moralis.switchNetwork(chain);   
    const accounts = await web3.eth.getAccounts()
    const account = accounts[0]
    const shortAcct = account.slice(0,6) + '...' + account.substring(account.length - 4)
    const connectBtn = document.getElementById("connect");
    connectBtn.innerHTML = shortAcct
    userAccount = account
}

async function updateInput(amount) {
    const el = document.getElementById('amountToken')
    el.value = 'Loading...'
    const options = { chain: chain, address: userAccount }
    const balances = await Moralis.Web3API.account.getTokenBalances(options);
    const tokenBalanceInfo = balances.find(b => b.token_address.toLowerCase() == mainTokenAddress.toLowerCase())
    if (!tokenBalanceInfo) {
        return el.value = 0
    }
    let tokenBalance = tokenBalanceInfo.balance
    tokenBalance *= amount/100
    el.value = parseInt(tokenBalance) / 1000000000
}

async function bridge(){
    const amountToBridge = document.getElementById("amountToken").value;
    const options = {type: "erc20", 
                 amount: Moralis.Units.Token(amountToBridge, "9"), 
                 receiver: mainBridgeAddress,
                 contractAddress: mainTokenAddress}
    const result = await Moralis.transfer(options)
    console.log('result', result)
    const el = document.getElementById('txHash')
    el.classList.remove('invisible')
    const elTx = document.getElementById('txHashLink')
    elTx.setAttribute('href', 'https://bscscan.com/tx/' + result.transactionHash)    
    elTx.innerHTML = result.transactionHash
}

async function renderBridgeData () {
    queryLocked().then( (lockedData)=> {
        buildTableLocked(lockedData);
    });
    queryBridged().then( (bridgedData) =>{
        buildTableBridged(bridgedData);
    });
}

async function subscribeUpdateBridged(){
    let query = new Moralis.Query("TokensBridged");
    query.equalTo("requester", ethereum.selectedAddress);
    const subscriptionBridged = await query.subscribe();
    subscriptionBridged.on('create', async (object) => {
        const depositHash= JSON.parse(JSON.stringify(object,["mainDepositHash"])).mainDepositHash;
    });
}

async function queryLocked(){
    const query = new Moralis.Query("TokensLocked");
    query.equalTo("requester", ethereum.selectedAddress);
    const results = await query.find()
    return JSON.parse(JSON.stringify(results, ["mainDepositHash", "amount", "requester"]))
}

async function queryBridged(){
    const query = new Moralis.Query("TokensBridged");
    query.equalTo("requester", ethereum.selectedAddress);
    const results = await query.find()
    return JSON.parse(JSON.stringify(results, ["mainDepositHash", "amount", "requester"]))
}

function buildTableLocked(data){
    document.getElementById("lockedTransactions").innerHTML = `<table class="table table-dark table-striped" id="lockedTable">
                                                            </table>`;
    const table = document.getElementById("lockedTable");
    const rowHeader = `<thead>
                            <tr>
                                <th>Main Deposit Hash</th>
                                <th>Amount Bridged</th>
                                <th>Requester</th>
                            </tr>
                        </thead>`
    table.innerHTML += rowHeader;
    for (let i=0; i < data.length; i++){
        let row = `<tr>
                        <td>${data[i].mainDepositHash}</td>
                        <td>${data[i].amount/1e9}</td>
                        <td>${data[i].requester}</td>
                    </tr>`
        table.innerHTML += row
    }
}

function buildTableBridged(data){
    document.getElementById("tokensBridged").innerHTML = `<table class="table table-dark table-striped" id="bridgedTable">
                                                            </table>`;
    const table = document.getElementById("bridgedTable");
    const rowHeader = `<thead>
                            <tr>
                                <th>Main Deposit Hash</th>
                                <th>Amount Bridged</th>
                                <th>Requester</th>
                            </tr>
                        </thead>`
    table.innerHTML += rowHeader;
    for (let i=0; i < data.length; i++){
        let row = `<tr>
                        <td>${data[i].mainDepositHash}</td>
                        <td>${data[i].amount/1e9}</td>
                        <td>${data[i].requester}</td>
                    </tr>`
        table.innerHTML += row
    }
}
