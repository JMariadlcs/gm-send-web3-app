
const main = async () => {
    const gmContractFactory = await hre.ethers.getContractFactory('gmPortal');
    const gmContract = await gmContractFactory.deploy({
        value: hre.ethers.utils.parseEther('0.1') //Deploy contract and fund it with ETH from my walllet
    });
    await gmContract.deployed();
  console.log('Contract addy:', gmContract.address);

  /*
   * Get Contract balance
   */
  let contractBalance = await hre.ethers.provider.getBalance(  //See if the contract actually has balance
    gmContract.address
  );
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  //Two gms for trial to test prize lottery
  const gmTxn = await gmContract.gm('This is gm #1');
  await gmTxn.wait();

  const gmTxn2 = await gmContract.gm('This is gm #2');
  await gmTxn2.wait();

  /*
   * Get Contract balance to see what happened!
   */
  contractBalance = await hre.ethers.provider.getBalance(gmContract.address);
  console.log(
    'Contract balance:',
    hre.ethers.utils.formatEther(contractBalance)
  );

  let allgms = await gmContract.getAllGms();
  console.log(allgms);
};



const runMain = async () => {
    try{
        await main();
        process.exit(0);
    }catch(error){
        console.log(error);
        process.exit(1)
    }
};

runMain();