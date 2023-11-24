// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error NotOwner();


contract FundMe {
    // https://youtu.be/gyMwXuJrbJQ?t=19035
    using PriceConverter for uint256;

    address public immutable owner;
    uint256 public constant MIN_USD = 10 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        if (msg.sender != owner) { revert NotOwner(); }
        _;
    }
    
    function fund() public payable {
        require(msg.value.getConversionRate() >= MIN_USD, "Not enough ETH.");
        // If condition is satisfied, the sent value will be 
        // automatically transferred to this contract's address
        
        // Do other stuff
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
        //     address funder = funders[funderIndex];
        //     addressToAmountFunded[funder] = 0;
        // }
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    // Triggered when one interacts with the contract WITHOUT msg.DATA
    receive() external payable {
        fund();
    }

    // Triggered when one interacts with the contract WITH msg.DATA
    fallback() external payable { 
        fund();
    }
}