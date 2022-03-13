// SPDX-License-Identifier: MIT

//This is a vesting contract for BTK token. 
//The contract is used for Team and First Investors token locking.

import "./BitKanz.sol";

pragma solidity = 0.8.10;

contract BTKvesting {
    using SafeMath for uint;
    BitKanz public BTK;
    address public owner;
    uint public monthly = 30 days;
    uint public totalBTK;

    event BTKClaimed(address Investor, uint Amount);
    event ChangeOwner(address NewOwner);
    event WithdrawalBNB(uint256 _amount, uint256 decimal, address to); 
    event WithdrawalBTK(address _tokenAddr, uint256 _amount,uint256 decimals, address to);
    
    struct VaultInvestor{
        uint amount;
        uint monthLock;
        uint monthAllow;
        uint lockTime;
        uint timeStart;
    }struct VaultTeam{
        uint amount;
        uint lockTime;
        uint timeStart;
    }

    mapping(address => bool) private Team;
    mapping(address => VaultTeam) private team;
    mapping(address => bool) public Investor;
    mapping(address => VaultInvestor) public investor;

    modifier onlyOwner (){
        require(msg.sender == owner, "Only BitKanz owner can add Investors");
        _;
    }
    modifier isTeam(address _team){
        require(Team[_team] = true);
        _;
    }
    modifier isInvestor(address _investor){
        require(Investor[_investor] = true);
        _;
    }

    constructor(BitKanz _btk) {
        owner = msg.sender;
        BTK = _btk;
    }
    function transferOwnership(address _newOwner)external onlyOwner{
        emit ChangeOwner(_newOwner);
        owner = _newOwner;
    }
    function addTeam(address _team, uint _amount, uint _lockTime) external onlyOwner{
        require(BTK.balanceOf(address(this)) >= totalBTK.add(_amount));
        uint lockTime = _lockTime.mul(1 days);
        require(_amount > 0, "Amount cannot be zero!");
        require(lockTime > 1095 days, "Team locking is at least 3 years!");
        team[_team].amount = _amount;
        team[_team].lockTime = lockTime;
        team[_team].timeStart = block.timestamp;
        Team[_team] = true;
        totalBTK = totalBTK.add(_amount);
    }
    function teamClaim() external isTeam(msg.sender){
        uint lockTime = team[msg.sender].lockTime;
        require(lockTime < block.timestamp, "Not yet to claim!");
        uint amount = team[msg.sender].amount;
        totalBTK = totalBTK.sub(amount);
        Team[msg.sender] = false;
        delete team[msg.sender];
        emit BTKClaimed(msg.sender, amount);
        BTK.transfer(msg.sender, amount);
    }
    function addInvestor(address _investor, uint _amount, uint _lockTime, uint _monthAllow) external onlyOwner{
        require(BTK.balanceOf(address(this)) >= totalBTK.add(_amount));
        uint lockTime = _lockTime.mul(1 days);
        require(_amount > 0, "Amount cannot be zero!");
        require(_monthAllow != 0, "Percentage cann't be equal to zero!");
        require(lockTime > block.timestamp.add(monthly.mul(3)), "Please set a time in the future more than 90 days!");
        uint monthCount = (lockTime.div(monthly));
        uint amountAllowed = _amount.mul(_monthAllow).div(100);
        require(_amount >= amountAllowed.mul(monthCount), "Operation is not legit please do proper calculations");
        investor[_investor].amount = _amount;
        investor[_investor].lockTime = lockTime;
        investor[_investor].monthAllow = _monthAllow;
        investor[_investor].timeStart = block.timestamp;
        investor[_investor].monthLock = block.timestamp.add(monthly);
        Investor[_investor] = true;
        totalBTK = totalBTK.add(_amount);
    }
    function claimMonthlyAmount() external isInvestor(msg.sender){
        uint totalTimeLock = investor[msg.sender].lockTime;
        uint remainAmount = investor[msg.sender].amount;
        uint checkTime = block.timestamp;
        require(totalTimeLock > block.timestamp, "Your Vesting period has ended please use {Full Claim} function");
        require(remainAmount > 0, "You don't have any tokens");
        require(checkTime <= investor[msg.sender].monthLock);
        uint addOneMonth = investor[msg.sender].monthLock;
        uint percentage = investor[msg.sender].monthAllow;   
        uint amountAllowed = remainAmount.mul(percentage).div(100);
        investor[msg.sender].amount = remainAmount.sub(amountAllowed);
        investor[msg.sender].monthLock = addOneMonth.add(monthly);
        totalBTK = totalBTK.sub(amountAllowed);
        if(investor[msg.sender].amount == 0){
            Investor[msg.sender] = false;
            delete investor[msg.sender];
        }
        emit BTKClaimed(msg.sender, amountAllowed);
        BTK.transfer(msg.sender, amountAllowed);
    }
    function claimRemainings() external isInvestor(msg.sender){
        uint totalTimeLock = investor[msg.sender].lockTime;
        require(totalTimeLock < block.timestamp, "Try using {Claim Monthly Amount} function");
        uint remainAmount = investor[msg.sender].amount;
        totalBTK = totalBTK.sub(remainAmount);
        Investor[msg.sender] = false;
        delete investor[msg.sender];
        emit BTKClaimed(msg.sender, remainAmount);
        BTK.transfer(msg.sender, remainAmount);
    }
    function withdrawalBTK(address _tokenAddr, uint256 _amount, uint256 decimal, address to) external onlyOwner() {
        uint amount = BTK.balanceOf(address(this)).sub(totalBTK);
        require(amount > 0, "No BTK available for withdrawal!");// can only withdraw what is not locked for team or investors.
        uint256 dcml = 10 ** decimal;
        ERC20 token = ERC20(_tokenAddr);
        emit WithdrawalBTK(_tokenAddr, _amount, decimal, to);
        token.transfer(to, _amount*dcml); 
    } 
    function withdrawalBNB(uint256 _amount, uint256 decimal, address to) external onlyOwner() {
        require(address(this).balance >= _amount);
        uint256 dcml = 10 ** decimal;
        emit WithdrawalBNB(_amount, decimal, to);
        payable(to).transfer(_amount*dcml);      
    }
    receive() external payable {}
}


//********************************************************
// Proudly Developed by MetaIdentity ltd. Copyright 2022
//********************************************************

