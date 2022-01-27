const serverUrl = "https://4bous1ow8mq6.usemoralis.com:2053/server";
const appId = "NfdSGtB1uypxKdY0ptyuj0Xdro9ljeuUTrYik5hA";
Moralis.start({ serverUrl, appId }); 

const childTokenAddress = "0x784cb74865fde16039aca9f42bf998cf3c15319d";
const sideBridgeAddress = "0x40390687c960b01cbd670fd8c7a7b5c82f10b776";
const chain = '0x13881'

let userAccount = ''

async function login(){
    const web3 = await Moralis.Web3.enableWeb3()
    renderReturnData();
    subscribeUpdateUnlocked();
    const chainIdHex = await Moralis.switchNetwork(chain);
    const accounts = await web3.eth.getAccounts()
    const account = accounts[0]
    const shortAcct = account.slice(0,6) + '...' + account.substring(account.length - 4)
    const connectBtn = document.getElementById("connect");
    connectBtn.innerHTML = shortAcct
}

async function updateInput(amount) {
    const el = document.getElementById('amountToken')
    el.value = 'Loading...'
    const options = { chain: chain, address: userAccount }
    const balances = await Moralis.Web3API.account.getTokenBalances(options);
    const tokenBalanceInfo = balances.find(b => b.token_address.toLowerCase() == childTokenAddress.toLowerCase())
    if (!tokenBalanceInfo) {
        return el.value = 0
    }
    let tokenBalance = tokenBalanceInfo.balance
    tokenBalance *= amount/100
    el.value = parseInt(tokenBalance) / 1000000000
}

async function returnToken(){
    const amountToReturn = document.getElementById("amountToken").value;
    const options = {type: "erc20", 
                 amount: Moralis.Units.Token(amountToReturn, "9"), 
                 receiver: sideBridgeAddress,
                 contractAddress: childTokenAddress}
    const result = await Moralis.transfer(options)
    console.log('result', result)
    const el = document.getElementById('txHash')
    el.classList.remove('invisible')
    const elTx = document.getElementById('txHashLink')
    elTx.setAttribute('href', 'https://etherscan.io/tx/' + result.transactionHash)
    elTx.innerHTML = result.transactionHash
}

async function renderReturnData () {
    queryReturned().then( (returnedData) => {
        buildTableReturned(returnedData);
    });
    queryUnlocked().then( (unlockedData) => {
        buildTableUnlocked(unlockedData);
    });
}

async function subscribeUpdateUnlocked(){
    let query = new Moralis.Query("TokensUnlocked");
    query.equalTo("requester", ethereum.selectedAddress);
    const subscriptionUnlocked = await query.subscribe();
    subscriptionUnlocked.on('create', async (object) => {
        const depositHash= JSON.parse(JSON.stringify(object,["sideDepositHash"])).sideDepositHash;
    });
}

async function queryReturned(){
    const query = new Moralis.Query("TokensReturned");
    query.equalTo("requester", ethereum.selectedAddress);
    const results = await query.find()
    return JSON.parse(JSON.stringify(results, ["sideDepositHash", "amount", "requester"]))
}

async function queryUnlocked(){
    const query = new Moralis.Query("TokensUnlocked");
    query.equalTo("requester", ethereum.selectedAddress);
    const results = await query.find()
    return JSON.parse(JSON.stringify(results, ["sideDepositHash", "amount", "requester"]))
}

function buildTableReturned(data){
    document.getElementById("returnedTransactions").innerHTML = `<table class="table table-dark table-striped" id="returnedTable">
                                                            </table>`;
    const table = document.getElementById("returnedTable");
    const rowHeader = `<thead>
                            <tr>
                                <th>Side Deposit Hash</th>
                                <th>Amount Bridged</th>
                                <th>Requester</th>
                            </tr>
                        </thead>`
    table.innerHTML += rowHeader;
    for (let i=0; i < data.length; i++){
        let row = `<tr>
                        <td>${data[i].sideDepositHash}</td>
                        <td>${data[i].amount/1e9}</td>
                        <td>${data[i].requester}</td>
                    </tr>`
        table.innerHTML += row
    }
}

function buildTableUnlocked(data){
    document.getElementById("tokensUnlocked").innerHTML = `<table class="table table-dark table-striped" id="unlockedTable">
                                                            </table>`;
    const table = document.getElementById("unlockedTable");
    const rowHeader = `<thead>
                            <tr>
                                <th>Side Deposit Hash</th>
                                <th>Amount Bridged</th>
                                <th>Requester</th>
                            </tr>
                        </thead>`
    table.innerHTML += rowHeader;
    for (let i=0; i < data.length; i++){
        let row = `<tr>
                        <td>${data[i].sideDepositHash}</td>
                        <td>${data[i].amount/1e9}</td>
                        <td>${data[i].requester}</td>
                    </tr>`
        table.innerHTML += row
    }
}
