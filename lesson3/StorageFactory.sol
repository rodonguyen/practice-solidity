// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./SimpleStorage.sol"; 

contract StorageFactory {
    SimpleStorage[] public simpleStorageList;

    function createSimpleStorageContract() public {
        simpleStorageList.push(new SimpleStorage());
    }

    function sfStore(uint256 _index, uint256 _simpleStorageNumber) public {
        simpleStorageList[_index].store(_simpleStorageNumber);       
    }

    function sfGet(uint256 _index) view  public returns(uint256) {
        return simpleStorageList[_index].retrieve();   
    }
}