// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FundMe {
    // State variables
    address private immutable owner;
    mapping(address => uint256) private funders;
    address[] private fundersArray;
    uint256 private totalWithdrawn;
    
    // Events
    event Funded(address indexed funder, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Fund function
    function fund() public payable {
        require(msg.value > 10 gwei, "Minimum funding amount is 10 gwei");
        
        if (funders[msg.sender] == 0) {
            fundersArray.push(msg.sender);
        }
        funders[msg.sender] += msg.value;
        
        emit Funded(msg.sender, msg.value);
    }

    // Withdraw all funds to owner
    function withdraw() public onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds to withdraw");

        totalWithdrawn += contractBalance;
        
        // Reset all funder balances
        for (uint256 i = 0; i < fundersArray.length; i++) {
            funders[fundersArray[i]] = 0;
        }
        delete fundersArray;

        // Transfer funds to owner
        (bool success, ) = payable(owner).call{value: contractBalance}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(owner, contractBalance);
    }

    // Withdraw specific amount to distinct address
    function withdrawToDistinctAddress(address _to, uint256 _amount) public onlyOwner {
        require(_amount <= address(this).balance, "Insufficient contract balance");
        require(_to != address(0), "Invalid address");

        totalWithdrawn += _amount;

        uint256 remainingAmount = _amount;
        uint256 i = 0;

        // Reset funder balances proportionally
        while (i < fundersArray.length && remainingAmount > 0) {
            address funder = fundersArray[i];
            if (funders[funder] <= remainingAmount) {
                remainingAmount -= funders[funder];
                funders[funder] = 0;
                fundersArray[i] = fundersArray[fundersArray.length - 1];
                fundersArray.pop();
            } else {
                funders[funder] -= remainingAmount;
                remainingAmount = 0;
                i++;
            }
        }

        // Transfer funds to specified address
        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(_to, _amount);
    }

    // Getter functions
    function getOwner() public view returns (address) {
        return owner;
    }

    function getFunderBalance(address _funder) public view returns (uint256) {
        return funders[_funder];
    }

    function getFunders() public view returns (address[] memory) {
        return fundersArray;
    }

    function getTotalWithdrawn() public view returns (uint256) {
        return totalWithdrawn;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // To receive ETH
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}