// SPDX-License-Identifer: MIT
pragma solidity ^0.8.0;

contract myContract {
    uint[] public nums = [1,2,3,4,5,6,7,8];

    address private contractOwner;
    constructor() {
        contractOwner = msg.sender;
    }

    function countEvenNumbers() public view returns(uint) {
        uint count = 0;
        for (uint i=0; i < nums.length; i++)
            if (isEvenNumber(nums[i]))
                count++;
        
        return count;
    }

    function isEvenNumber(uint _number) public pure returns(bool) {
        return _number % 2 == 0? true : false;
    }

    function isContractOwner() public view returns(bool) {
        return msg.sender == contractOwner;
    }

}