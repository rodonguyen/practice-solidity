// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error Blog__NotPlatformDeveloper();
error Blog__NotEnoughPrimaryCost();
error Blog__NotEnoughSecondaryCost();

contract Blog {
  using PriceConverter for uint256;

  mapping(address => string[]) private s_addressToBlogPosts;
  mapping(address => uint256) private s_addressToBlogPostCount;
  mapping(address => uint256) private s_addressToAmountFunded;
  uint256 public s_primaryCost = 0.0001 * 10**18;
  uint256 public s_secondaryCost = 0.00005 * 10**18;
  uint256 public s_totalFundedEntireHistory;
  address private immutable i_platformDeveloper;
  AggregatorV3Interface private s_priceFeed;
  
  constructor(address priceFeed) {
    s_priceFeed = AggregatorV3Interface(priceFeed);
    i_platformDeveloper = msg.sender;
  }

  modifier onlyPlatformDeveloper() {
    if (msg.sender != i_platformDeveloper) revert Blog__NotPlatformDeveloper();
    _;
  }

  modifier enoughPrimaryCost() {
    if (msg.value >= s_primaryCost) revert Blog__NotEnoughPrimaryCost(); 
    _;
  }
  
  modifier enoughSecondaryCost() {
    if (msg.value >= s_secondaryCost) revert Blog__NotEnoughSecondaryCost(); 
    _;
  }

  function getPlatformDeveloper() public view returns (address) {
    return i_platformDeveloper;
  }
  
  function getPrimaryCost() public view returns (uint256) {
    return s_primaryCost;
  }
  
  function getSecondaryCost() public view returns (uint256) {
    return s_secondaryCost;
  }

  function getTotalFundedEntireHistory() public view returns (uint256) {
    return s_totalFundedEntireHistory;
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
  
  function getCurrentBalance() public view returns (uint256) {
    return address(this).balance;
  }

  // =============================================
  // MAIN FUNCTIONALITIES OF `BLOG` SMART CONTRACT

  function addBlog(string memory _blog) public payable enoughPrimaryCost {
    // Add blog post to sender address
    s_addressToBlogPosts[msg.sender].push(_blog);
    s_addressToBlogPostCount[msg.sender] += 1;

    recordBloggerContribution();
  }

  function editBlogWithIndex(uint256 _index, string memory _blog) public payable enoughSecondaryCost {
    s_addressToBlogPosts[msg.sender][_index] = _blog;
    recordBloggerContribution();
  }

  function getAmountFundedByAddress(address _address) public view returns(uint256) {
    return s_addressToAmountFunded[_address];
  }

  function changePrimaryCost(uint256 _newPrimaryCost) public onlyPlatformDeveloper {
    s_primaryCost = _newPrimaryCost;
  }

  function changeSecondaryCost(uint256 _newSecondaryCost) public onlyPlatformDeveloper {
    s_secondaryCost = _newSecondaryCost;
  }

  // Let dev withdraw fund, specify amount or none
  function withdraw() public payable onlyPlatformDeveloper {
    payable(msg.sender).transfer(address(this).balance);
  }


  // ==============
  // Util functions
  function recordBloggerContribution() private {
    s_totalFundedEntireHistory += msg.value;
    s_addressToAmountFunded[msg.sender] += msg.value;
  }
}
