// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HotelRoom {
    address payable public owner;
    enum Statuses {
        Vacant,
        Occupied
    }
    Statuses public currentStatus;
    event Occupy(address _occupant, uint _value);

    constructor() {
        owner = payable(msg.sender);
        currentStatus = Statuses.Vacant;
    }

    modifier onlyWhileVacant() {
        require(currentStatus == Statuses.Vacant, "Currently occupied.");
        _;
    }

    modifier costs(uint _amount) {
        require(msg.value >= _amount, "Not enough Ether provided.");
        _;
    }

    function book() public payable onlyWhileVacant costs(2 ether) {
        // Change vacancy status
        currentStatus = Statuses.Occupied;

        // pay (contract) owner
        // use `value` field in `call()` to transfer fund = `owner.transfer(msg.value);`
        (bool sent, bytes memory data) = owner.call{value: msg.value}("");
        require(sent);
        emit Occupy(msg.sender, msg.value);
    }
}
