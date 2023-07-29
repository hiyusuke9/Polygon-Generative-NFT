const hre = require('hardhat');
const { expect } = require('chai');

describe('Generative-NFT', () => {
    it('mint is successed', async () => {
        const baseTokenURI = 'ipfs.io/ipfs/QmSrtFuT1oXD4EV2d7D3VaSAR5cHpWTq5pbPHBLayYFSsc/';

        const [owner] = await hre.ethers.getSigners();

        const contractFactory = await hre.ethers.getContractFactory(
            'NFTCollectible',
        );

        const contract =await contractFactory.deploy(baseTokenURI);

        await contract.deployed();

        let txn = await contract.reserveNFTs();
        await txn.wait();
        let tokens = await contract.tokensOfOwner(owner.address);
        expect(tokens.length).to.equal(10);

        txn = await contract.mintNFTs(3, {
            value: hre.ethers.utils.parseEther('0.03'),
        });
        await txn.wait();
        tokens = await contract.tokensOfOwner(owner.address);
        expect(tokens.length).to.equal(13);
    });
});