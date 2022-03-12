// SPDX-License-Identifier: MIT

import "./BitKanz.sol";

pragma solidity = 0.8.10;

contract BTKvesting {
    using SafeMath for uint;
    BitKanz public BTK;
    address public owner;
    uint public monthly = 30 days;

    event BTKClaimed(address Investor, uint Amount);
    event ChangeOwner(address NewOwner);
    
    struct Vault{
        uint amount;
        uint monthLock;
        uint monthAllow;
        uint lockTime;
        uint timeStart;
    }
    mapping(address => bool) public Investor;
    mapping(address => Vault) public investor;

    modifier onlyOwner (){
        require(msg.sender == owner, "Only BitKanz owner can add Investors");
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
    function addInvestor(address _investor, uint _amount, uint _lockTime, uint _monthAllow) external onlyOwner{
        require(_monthAllow != 0, "Percentage cann't be equal to zero!");
        require(_lockTime > block.timestamp, "Please set a time in the future!");
        uint monthCount = (_lockTime.div(monthly));
        uint amountAllowed = _amount.mul(_monthAllow).div(100);
        require(_amount >= amountAllowed.mul(monthCount), "Operation is not legit please do proper calculations");
        investor[_investor].amount = _amount;
        investor[_investor].lockTime = _lockTime;
        investor[_investor].monthAllow = _monthAllow;
        investor[_investor].timeStart = block.timestamp;
        investor[_investor].monthLock = block.timestamp.add(monthly);
        Investor[_investor] = true;
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
        Investor[msg.sender] = false;
        delete investor[msg.sender];
        emit BTKClaimed(msg.sender, remainAmount);
        BTK.transfer(msg.sender, remainAmount);
    }
}

