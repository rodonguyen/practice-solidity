// SPDX-License-Identifier: MIT
pragma solidity >=0.8 <0.9;

contract SimpleStorage {


    mapping (string => string) public whoGivesWhat;
    struct Gift {
        string giftName;
        string from;
    }

    Gift[] public gifts;

    function addGift(string memory _giftName, string memory _from) public {
        Gift memory newGift = Gift({giftName: _giftName, from: _from});
        gifts.push(newGift);

        whoGivesWhat[_from] = _giftName;
    }

    function getGifts() view public returns(Gift[] memory) {
        return gifts;
    }
}

