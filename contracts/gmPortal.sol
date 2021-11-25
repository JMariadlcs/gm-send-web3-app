// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract gmPortal{
    uint256 totalgms;

    //Variable used to generate a random number (to pick an ETH winner)
    uint256 private seed;

    //We are creating a Solidity event
    event NewGm(address indexed from, uint256 timestamp, string message);

    //Gm struct is created
    struct Gm{
        address gmer; //Addres of the user who send gm
        string message; //Message by the user who gm
        uint256 timestamp; //Timestamp when the user send gm
    }

    //Creation of array that will contain struct of Gm
    //Array of structs
    Gm[] gms;

    //We are creating a 'mapping' to prevent stamps (to introduce cooldowns)
    mapping(address => uint256) public lastGmedAt;

    constructor() payable {  //Word 'payable' allows us to send eth to another person in any part of the contract
        console.log("Hey there! This is the gmPortal.sol contract!!");

        //Initial seed value is set
        seed = (block.timestamp + block.difficulty) % 100;
    }

    //Message introduced by the user is needed in gm function
    function gm(string memory _message) public{

        //We check that current timestamp is higher than 40 secondsls than last timestamp was stored
        require(
            lastGmedAt[msg.sender] + 40 seconds < block.timestamp,
            "You need to wait 40 seconds before sending a new gm fren!"
        );

        //Update the current timestamp we have for the user
        //If require is fulliled code will reach here. If not, function will finished above
        lastGmedAt[msg.sender] = block.timestamp;

        totalgms += 1;
        console.log("%s has gmed you!", msg.sender);

        //Data is stored in the array
         gms.push(Gm(msg.sender, _message, block.timestamp)); //We push a Gm struct with its corresponding data into de gms array

        //We generate a new seed each time a gm is sent (to make hacking more difficult)
        seed = (block.timestamp + block.difficulty) % 100;
        
        //Define the chance of a user winning the prize (50% in our case)
        if (seed <= 50){
            console.log("%s won the ETH prize!", msg.sender);
            console.log("Random number generated %d", seed);

        //We are coding for sending 0.0001 ether to everyone that send me a gm
        uint256 prizeAmount = 0.0001 ether;

        require( //If requirements are not met, transaction will be cancelled and function quit
            prizeAmount<= address(this).balance, //To check if we have enought amount for paying the prize (The contract address)
            "Trying to withdraw more money than the contract has"
        );

        (bool success, ) = (msg.sender).call{value: prizeAmount}(""); //Line used for sending money
        require(success, "Failed to withdraw money from contract"); //Check if money transaction succeed
        }

        //emit of the event declared on top of the contract
        emit NewGm(msg.sender, block.timestamp, _message);
    }

    //Function that returns all the gms sent to our web3site. It will return an array
    function getAllGms() public view returns (Gm[] memory){
        return gms;
    }

    function getTotalgms() public view returns (uint256){
        console.log("We have %d total gms!", totalgms);
        return totalgms;
    }

}