// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error Blog__NotPlatformDeveloper();
error Blog__NotEnoughPrimaryCost();
error Blog__NotEnoughSecondaryCost();
error Blog__NotEnoughBalance();

/** @title Decentralised Blogging Smart Contract
 *  @author Rodo
 */
contract Blog {
  mapping(address => string[]) private s_addressToBlogPosts;
  mapping(address => uint256) private s_addressToBlogPostCount;
  mapping(address => uint256) private s_addressToAmountFunded;
  uint256 public s_primaryCost = 0.0001 * 10**18;
  uint256 public s_secondaryCost = 0.00002 * 10**18;
  uint256 public s_totalFundedEntireHistory;
  address private immutable i_platformDeveloper;
  
  constructor() {
    i_platformDeveloper = msg.sender;
  }

  modifier onlyPlatformDeveloper() {
    if (msg.sender != i_platformDeveloper) revert Blog__NotPlatformDeveloper();
    _;
  }

  modifier enoughPrimaryCost() {
    if (msg.value < s_primaryCost) revert Blog__NotEnoughPrimaryCost(); 
    _;
  }
  
  modifier enoughSecondaryCost() {
    if (msg.value < s_secondaryCost) revert Blog__NotEnoughSecondaryCost(); 
    _;
  }

  fallback() external payable {
    recordBloggerContribution();
  }

  receive() external payable { 
    recordBloggerContribution();
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
  
  function getCurrentBalance() public view returns (uint256) {
    return address(this).balance;
  }

  // =============================================
  // MAIN FUNCTIONALITIES OF `BLOG` SMART CONTRACT

  function addBlog(string memory _blog) public payable enoughPrimaryCost {
    s_addressToBlogPosts[msg.sender].push(_blog);
    s_addressToBlogPostCount[msg.sender] += 1;

    recordBloggerContribution();
  }

  function editBlogWithIndex(uint256 _index, string memory _blog) public payable enoughSecondaryCost {
    s_addressToBlogPosts[msg.sender][_index] = _blog;
    recordBloggerContribution();
  }

  function getBlogPosts(address _address) public view returns(string[] memory) {
    return s_addressToBlogPosts[_address];
  }

  function getABlogPost(address _address, uint256 _index) public view returns(string memory) {
    return s_addressToBlogPosts[_address][_index];
  }

  function getBlogPostCount(address _address) public view returns(uint256) {
    return s_addressToBlogPostCount[_address];
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

  function withdraw() public payable onlyPlatformDeveloper {
    payable(msg.sender).transfer(address(this).balance);
  }

  function withdraw(uint256 _withdrawalAmount) public payable onlyPlatformDeveloper {
    if (_withdrawalAmount > address(this).balance) {
      revert Blog__NotEnoughBalance();
    }
    payable(msg.sender).transfer(_withdrawalAmount);
  }


  // ==============
  // Util functions
  function recordBloggerContribution() private {
    s_totalFundedEntireHistory += msg.value;
    s_addressToAmountFunded[msg.sender] += msg.value;
  }
}
