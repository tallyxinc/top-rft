const ERC1358FT = artifacts.require('token/ERC1358FTFull');
const ERC1358FTEnumerable = artifacts.require('token/ERC1358FTEnumerable');
const ERC1358FTMetadata = artifacts.require('token/ERC1358FTMetadata');
const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const Utils = require('./utils');

let precision = new BigNumber("1000000000000000000");

contract('ERC1358FT', accounts => {
    
    let name = "tallyx_0";
    let symbol = "topp";
    let decimals = 18;
    let totalSupply = new BigNumber('1000').mul(precision);
    let nftAddress = accounts[1];
    let initialTokenId = 0;
    let owner = accounts[0];

    async function deploy() {
        let erc1358 = await ERC1358FT.new(
            name, 
            symbol,
            decimals,
            totalSupply,
            nftAddress,
            initialTokenId,
            owner
        );
        return erc1358;
    }

    describe('Check deployment of ERC1358FTEnumerable', () => {
        let erc1358Enum;

        beforeEach(async () => {
            erc1358Enum = await ERC1358FTEnumerable.new(
                totalSupply,
                nftAddress,
                initialTokenId,
                owner
            );
        });

        it('should not deploy in case totalSupply =< 0', async () => {
            await ERC1358FTEnumerable.new(
                new BigNumber('0'),
                nftAddress,
                initialTokenId,
                owner
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);  
        });

        it('should not deploy in case nftAddress == address(0)', async () => {
            await ERC1358FTEnumerable.new(
                totalSupply,
                '0x0',
                initialTokenId,
                owner
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it('should not deploy in case onwer == address(0)', async () => {
            await ERC1358FTEnumerable.new(
                totalSupply,
                nftAddress,
                initialTokenId,
                '0x0'
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it('should check totalSupply', async () => {
            let _totalSupply = await erc1358Enum.totalSupply();
            assert.equal(new BigNumber(_totalSupply).valueOf(), totalSupply.valueOf(), "totalSupply is not equal");
        });

        it('should check nftAddress and initialNFT tokenId', async () => {
            let nft = await erc1358Enum.getNFT();
            assert.equal(nft[0], nftAddress, "nftAddress is not equal");
            assert.equal(nft[1], initialTokenId, "initialTokenId is not equal");
        });

        it('should check owner balance and { tokenHolder[owner] == true } statement', async () => {
            let balance = await erc1358Enum.balanceOf(owner);
            assert.equal(new BigNumber(balance).valueOf(), totalSupply.valueOf(), "balance is not equal");
            let registryLength = await erc1358Enum.holdersCount();
            assert.equal(new BigNumber(registryLength).valueOf(), 1, "registryLength is not equal");
            let tokenHolder = await erc1358Enum.holderByIndex(0);
            assert.equal(tokenHolder, owner, "tokenHolder is not equal");
            let tokenHolderStatus = await erc1358Enum.tokenHolders.call(owner);
            assert.equal(tokenHolderStatus, true, "tokenHolderStatus is not equal");
        });
    });

    describe('Check deployment of ERC1358FTMetadata', () => {
        let erc1358Metadata;

        beforeEach(async () => {
            erc1358Metadata = await ERC1358FTMetadata.new(
                name,
                symbol,
                decimals
            );
        });

        it('should not deploy in case decimals == 0', async () => {
            await ERC1358FTMetadata.new(
                name,
                symbol,
                new BigNumber('0')
            )
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it('should check name', async () => {
            let _name = await erc1358Metadata.name();
            assert.equal(_name, name, "name is not equal");
        });

        it('should check symbol', async () => {
            let _symbol = await erc1358Metadata.symbol();
            assert.equal(_symbol, symbol, "symbol is not equal");
        });

        it('should check decimals', async () => {
            let _decimals = await erc1358Metadata.decimals();
            assert.equal(_decimals, decimals, "decimals is not equal");
        });
    });

    describe('Check FT token flow', () => {

        let erc1358ft;

        beforeEach(async() => {
            erc1358ft = await deploy();
        })

        it('should check transfer', async () => {
            let to = accounts[2];
            let amount = new BigNumber('100').mul(precision);
            let balanceOf = await erc1358ft.balanceOf(to);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");

            await erc1358ft.transfer(to, amount, {from: accounts[1]})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.transfer(0x0, amount, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.transfer(to, new BigNumber('2000').mul(precision), {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.transfer(to, amount, {from: owner})
                .then(Utils.receiptShouldSucceed);

            balanceOf = await erc1358ft.balanceOf(owner);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('900').mul(precision).valueOf(), "balanceOf is not equal");
            balanceOf = await erc1358ft.balanceOf(to);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('100').mul(precision).valueOf(), "balanceOf is not equal");

            let isTokenHolder = await erc1358ft.tokenHolders.call(to);
            assert.equal(isTokenHolder, true, "isTokenHolder is not equal");

            let registryLength = await erc1358ft.holdersCount();
            assert.equal(new BigNumber(registryLength).valueOf(), new BigNumber('2'), "registryLength is not equal");
        });

        it('should check approve and allowance', async () => {
            let operator = accounts[2];
            let owner2 = accounts[3];
            let amount = new BigNumber('100').mul(precision);
            let allowance = await erc1358ft.allowance(owner, operator);
            assert.equal(new BigNumber(allowance).valueOf(), new BigNumber('0'), "allowance is not equal");

            allowance = await erc1358ft.allowance(owner2, operator);
            assert.equal(new BigNumber(allowance).valueOf(), new BigNumber('0'), "allowance is not equal");

            await erc1358ft.approve(0x0, amount, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.approve(operator, amount, {from: owner})
                .then(Utils.receiptShouldSucceed);

            allowance = await erc1358ft.allowance(owner, operator);
            assert.equal(new BigNumber(allowance).valueOf(), new BigNumber('100').mul(precision).valueOf(), "allowance is not equal");

            await erc1358ft.approve(0x0, amount, {from: owner2})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.approve(operator, amount, {from: owner2})
                .then(Utils.receiptShouldSucceed);

            allowance = await erc1358ft.allowance(owner2, operator);
            assert.equal(new BigNumber(allowance).valueOf(), new BigNumber('100').mul(precision).valueOf(), "allowance is not equal");
        });

        it('should check increaseAllowance and decreaseAllowance', async () => {
            let operator = accounts[2];
            let amount = new BigNumber('100').mul(precision);

            let allowance = await erc1358ft.allowance(owner, operator);
            assert.equal(new BigNumber(allowance).valueOf(), new BigNumber('0'), "allowance is not equal");

            await erc1358ft.approve(0x0, amount, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.approve(operator, amount, {from: owner})
                .then(Utils.receiptShouldSucceed);

            await erc1358ft.increaseAllowance(0x0, amount, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.increaseAllowance(operator, amount, {from: owner})
                .then(Utils.receiptShouldSucceed);

            allowance = await erc1358ft.allowance(owner, operator);
            assert.equal(new BigNumber(allowance).valueOf(), new BigNumber(amount.add(amount)).valueOf(), "allowance is not equal");

            await erc1358ft.decreaseAllowance(0x0, amount, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.decreaseAllowance(operator, amount, {from: owner})
                .then(Utils.receiptShouldSucceed);

            allowance = await erc1358ft.allowance(owner, operator);
            assert.equal(new BigNumber(allowance).valueOf(), amount, "allowance is not equal");
        });

        it('should check transferFrom', async () => {
            let to = accounts[2];
            let amount = new BigNumber('100').mul(precision);
            let balanceOf = await erc1358ft.balanceOf(to);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");

            await erc1358ft.approve(0x0, amount, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.approve(to, amount, {from: owner})
                .then(Utils.receiptShouldSucceed);

            let allowance = await erc1358ft.allowance(owner, to);
            assert.equal(new BigNumber(allowance).valueOf(), amount.valueOf(), "allowance is not equal");

            await erc1358ft.transferFrom(owner, to, amount, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.transferFrom(owner, 0x0, amount, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.transferFrom(owner, to, amount, {from: to})
                .then(Utils.receiptShouldSucceed);

            allowance = await erc1358ft.allowance(owner, to);
            assert.equal(new BigNumber(allowance).valueOf(), new BigNumber('0').valueOf(), "allowance is not equal");

            let isTokenHolder = await erc1358ft.tokenHolders.call(to);
            assert.equal(isTokenHolder, true, "isTokenHolder is not equal");

            let registryLength = await erc1358ft.holdersCount();
            assert.equal(new BigNumber(registryLength).valueOf(), new BigNumber('2'), "registryLength is not equal");
        });

        it('should check batchTransfer', async () => {
            let receivers = [accounts[2], accounts[3], accounts[4]];
            let values = [
                new BigNumber('100').mul(precision),
                new BigNumber('200').mul(precision),
                new BigNumber('300').mul(precision)
            ];
            let errorValues1 = [
                new BigNumber('100').mul(precision),
                new BigNumber('200').mul(precision)
            ];
            let errorValues2 = [
                new BigNumber('100').mul(precision),
                new BigNumber('200').mul(precision),
                new BigNumber('701').mul(precision)  
            ];

            let balanceOf = await erc1358ft.balanceOf(receivers[0]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");
            let tokenHolder = await erc1358ft.tokenHolders.call(receivers[0]);
            assert.equal(tokenHolder, false, "tokenHolder is not equal");

            balanceOf = await erc1358ft.balanceOf(receivers[1]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[1]);
            assert.equal(tokenHolder, false, "tokenHolder is not equal");

            balanceOf = await erc1358ft.balanceOf(receivers[2]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[2]);
            assert.equal(tokenHolder, false, "tokenHolder is not equal");

            await erc1358ft.batchTransfer(receivers, errorValues1, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.batchTransfer(receivers, errorValues2, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.batchTransfer(receivers, values, {from: owner})
                .then(Utils.receiptShouldSucceed);


            balanceOf = await erc1358ft.balanceOf(receivers[0]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('100').mul(precision).valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[0]);
            assert.equal(tokenHolder, true, "tokenHolder is not equal");

            balanceOf = await erc1358ft.balanceOf(receivers[1]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('200').mul(precision).valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[1]);
            assert.equal(tokenHolder, true, "tokenHolder is not equal");

            balanceOf = await erc1358ft.balanceOf(receivers[2]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('300').mul(precision).valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[2]);
            assert.equal(tokenHolder, true, "tokenHolder is not equal");

            let getHolder = await erc1358ft.holderByIndex(0);
            assert.equal(getHolder, owner, "getTokenHolder[0] is not equal");
            getHolder = await erc1358ft.holderByIndex(1);
            assert.equal(getHolder, receivers[0], "getTokenHolder[1] is not equal");
            getHolder = await erc1358ft.holderByIndex(2);
            assert.equal(getHolder, receivers[1], "getTokenHolder[2] is not equal");
            getHolder = await erc1358ft.holderByIndex(3);
            assert.equal(getHolder, receivers[2], "getTokenHolder[3] is not equal");

            let holders = await erc1358ft.holders(0,4);
            assert.equal(holders[0][0], owner, "address of holder[0][0] is not equal")
            assert.equal(new BigNumber(holders[1][0]).valueOf(), new BigNumber(400).mul(precision).valueOf(), "balance of holder[0][0] not equal");
            assert.equal(holders[0][1], receivers[0], "address of holder[0][1] is not equal")
            assert.equal(new BigNumber(holders[1][1]).valueOf(), new BigNumber(100).mul(precision).valueOf(), "balance of holder[0][1] not equal");
            assert.equal(holders[0][2], receivers[1], "address of holder[0][2] is not equal")
            assert.equal(new BigNumber(holders[1][2]).valueOf(), new BigNumber(200).mul(precision).valueOf(), "balance of holder[0][2] not equal");
            assert.equal(holders[0][3], receivers[2], "address of holder[0][3] is not equal")
            assert.equal(new BigNumber(holders[1][3]).valueOf(), new BigNumber(300).mul(precision).valueOf(), "balance of holder[0][3] not equal");

        
            // cause is bigger than holders count
            await erc1358ft.holders(0,5)
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            // cause less than min index
            await erc1358ft.holders(-1,3)
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });

        it('should check batchTransferFrom', async () => {
            let approvalAgent = accounts[5];
            let approvalSum = new BigNumber('600').mul(precision);
            let receivers = [accounts[2], accounts[3], accounts[4]];
            let values = [
                new BigNumber('100').mul(precision),
                new BigNumber('200').mul(precision),
                new BigNumber('300').mul(precision)
            ];
            let errorValues1 = [
                new BigNumber('100').mul(precision),
                new BigNumber('200').mul(precision)
            ];
            let errorValues2 = [
                new BigNumber('100').mul(precision),
                new BigNumber('200').mul(precision),
                new BigNumber('701').mul(precision)  
            ];

            await erc1358ft.approve(0x0, approvalSum, {from: owner})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.approve(approvalAgent, approvalSum, {from: owner})
                .then(Utils.receiptShouldSucceed);

            let allowance = await erc1358ft.allowance(owner, approvalAgent);
            assert.equal(new BigNumber(allowance).valueOf(), approvalSum.valueOf(), "allowance is not equal");

            let balanceOf = await erc1358ft.balanceOf(receivers[0]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");
            let tokenHolder = await erc1358ft.tokenHolders.call(receivers[0]);
            assert.equal(tokenHolder, false, "tokenHolder is not equal");

            balanceOf = await erc1358ft.balanceOf(receivers[1]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[1]);
            assert.equal(tokenHolder, false, "tokenHolder is not equal");

            balanceOf = await erc1358ft.balanceOf(receivers[2]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('0').valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[2]);
            assert.equal(tokenHolder, false, "tokenHolder is not equal");

            await erc1358ft.batchTransferFrom(owner, receivers, errorValues1, {from: approvalAgent})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.batchTransferFrom(owner, receivers, errorValues2, {from: approvalAgent})
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            await erc1358ft.batchTransferFrom(owner, receivers, values, {from: approvalAgent})
                .then(Utils.receiptShouldSucceed);


            balanceOf = await erc1358ft.balanceOf(receivers[0]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('100').mul(precision).valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[0]);
            assert.equal(tokenHolder, true, "tokenHolder is not equal");

            balanceOf = await erc1358ft.balanceOf(receivers[1]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('200').mul(precision).valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[1]);
            assert.equal(tokenHolder, true, "tokenHolder is not equal");

            balanceOf = await erc1358ft.balanceOf(receivers[2]);
            assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('300').mul(precision).valueOf(), "balanceOf is not equal");
            tokenHolder = await erc1358ft.tokenHolders.call(receivers[2]);
            assert.equal(tokenHolder, true, "tokenHolder is not equal");

            let getHolder = await erc1358ft.holderByIndex(0);
            assert.equal(getHolder, owner, "getTokenHolder[0] is not equal");
            getHolder = await erc1358ft.holderByIndex(1);
            assert.equal(getHolder, receivers[0], "getTokenHolder[1] is not equal");
            getHolder = await erc1358ft.holderByIndex(2);
            assert.equal(getHolder, receivers[1], "getTokenHolder[2] is not equal");
            getHolder = await erc1358ft.holderByIndex(3);
            assert.equal(getHolder, receivers[2], "getTokenHolder[3] is not equal");

            let holders = await erc1358ft.holders(0,4);
            assert.equal(holders[0][0], owner, "address of holder[0][0] is not equal")
            assert.equal(new BigNumber(holders[1][0]).valueOf(), new BigNumber(400).mul(precision).valueOf(), "balance of holder[0][0] not equal");
            assert.equal(holders[0][1], receivers[0], "address of holder[0][1] is not equal")
            assert.equal(new BigNumber(holders[1][1]).valueOf(), new BigNumber(100).mul(precision).valueOf(), "balance of holder[0][1] not equal");
            assert.equal(holders[0][2], receivers[1], "address of holder[0][2] is not equal")
            assert.equal(new BigNumber(holders[1][2]).valueOf(), new BigNumber(200).mul(precision).valueOf(), "balance of holder[0][2] not equal");
            assert.equal(holders[0][3], receivers[2], "address of holder[0][3] is not equal")
            assert.equal(new BigNumber(holders[1][3]).valueOf(), new BigNumber(300).mul(precision).valueOf(), "balance of holder[0][3] not equal");

        
            // cause is bigger than holders count
            await erc1358ft.holders(0,5)
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);

            // cause less than min index
            await erc1358ft.holders(-1,3)
                .then(Utils.receiptShouldFailed)
                .catch(Utils.catchReceiptShouldFailed);
        });
    });
});