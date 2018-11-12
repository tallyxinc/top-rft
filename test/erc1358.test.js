const RFT = artifacts.require('token/RFT');
const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const Utils = require('./utils');

let precision = new BigNumber("1000000000000000000");

contract('RFT', accounts => {
	
	let rft, ft1Address;
	let owner = accounts[0];
	let name = "tallyx_0";
	let symbol = "topp";

	beforeEach(async () => {
		rft = await RFT.new(name, symbol, {from: owner});
	});

	it('should check metadata', async () => {
		const _name = await rft.name();
		assert.equal(_name, name, "name is not equal");
		const _symbol = await rft.symbol();
		assert.equal(_symbol, symbol, "symbol is not equal");
	});

	it('should not create Fungible Token cause decimals == 0', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 0;
		let tokenOwner = accounts[1];
		let fungibleTokenSupply = new BigNumber('1000').mul(precision);
		
		await rft.mint(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create Fungible Token cause tokenOwner == address(0)', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 18;
		let tokenOwner = 0;
		let fungibleTokenSupply = new BigNumber('1000').mul(precision);
		
		await rft.mint(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should not create Fungible Token cause fungibleTokenSupply == 0', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 18;
		let tokenOwner = accounts[1];
		let fungibleTokenSupply = new BigNumber('0').mul(precision);
		
		await rft.mint(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	it('should check Fungible Token creation', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 18;
		let tokenOwner = accounts[1];
		let fungibleTokenSupply = new BigNumber('1000').mul(precision);
		
		await rft.mint(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		).then(Utils.receiptShouldSucceed);

		let ftAddress = await rft.ftAddresses.call(new BigNumber('0'));
		console.log('Fungible token address: ' + ftAddress);
		ft1Address = ftAddress;

		let nftValue = await rft.nftValues.call(new BigNumber('0'));
		assert.equal(new BigNumber(nftValue).valueOf(), fungibleTokenSupply.valueOf(), "nftValue is not equal");
	});

	it('should check burn', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 18;
		let tokenOwner = accounts[1];
		let fungibleTokenSupply = new BigNumber('1000').mul(precision);
		
		await rft.mint(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		).then(Utils.receiptShouldSucceed);

		let ftAddress = await rft.ftAddresses.call(new BigNumber('0'));
		console.log('Fungible token address: ' + ftAddress);
		ft1Address = ftAddress;

		let nftValue = await rft.nftValues.call(new BigNumber('0'));
		assert.equal(new BigNumber(nftValue).valueOf(), fungibleTokenSupply.valueOf(), "nftValue is not equal");

		await rft.burn(tokenOwner, new BigNumber('0'))
			.then(Utils.receiptShouldSucceed);

		ftAddress = await rft.ftAddresses.call(new BigNumber('0'));
		assert.equal(ftAddress, 0x0, "address is not equal");

		nftValue = await rft.nftValue.call(new BigNumber('0'));
		assert.equal(nftValue, 0, "nftValue is not equal");
	});

	describe('Check nftValue | ftHolderBalance | ftHoldersBalances' + 
		'| ftHoldersCount | ftAddress', () => {

		let firstFungible, secondFungible;

		beforeEach(async () => {
			let name_1 = "toki_1";
			let name_2 = "toki_2";
			let symbol_1 = "TK1";
			let symbol_2 = "TK2";
			let decimals = 18;
			let tokenOwner_1 = accounts[1];
			let tokenOwner_2 = accounts[2];
			let fungibleTokenSupply_1 = new BigNumber('1000').mul(precision);
			let fungibleTokenSupply_2 = new BigNumber('500').mul(precision);
		
			await rft.mint(
				name_1,
				symbol_1,
				decimals,
				tokenOwner_1,
				fungibleTokenSupply_1,
				{from: owner}
			).then(Utils.receiptShouldSucceed);
			firstFungible = await rft.ftAddresses.call(0);

			await rft.mint(
				name_2,
				symbol_2,
				decimals,
				tokenOwner_2,
				fungibleTokenSupply_2,
				{from: owner}
			).then(Utils.receiptShouldSucceed);
			secondFungible = await rft.ftAddresses.call(1);
		});

		it('should check nftValue', async () => {
			let tokenId = 0;
			let value = new BigNumber('1000').mul(precision);

			let nftValue = await rft.nftValue(tokenId);
			assert.equal(new BigNumber(nftValue).valueOf(), value, "nftValue is not equal");
		});

		it('should check ftHolderBalance', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;
			let holder = accounts[1];
			let holderSecond = accounts[2];

			let balanceOfHolder = await rft.ftHolderBalance(tokenId, holder);
			assert.equal(new BigNumber(balanceOfHolder).valueOf(), new BigNumber('1000').mul(precision).valueOf(), "balanceOfHolder is not equal");

			balanceOfHolder = await rft.ftHolderBalance(tokenIdSecond, holderSecond);
			assert.equal(new BigNumber(balanceOfHolder).valueOf(), new BigNumber('500').mul(precision).valueOf(), "balanceOfHolder is not equal");
		});

		it('should check ftHoldersBalances', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;

			let tokenHoldersAndBalances = await rft.ftHoldersBalances(tokenId, 0, 1);
			let holders = tokenHoldersAndBalances[0];
			let balances = tokenHoldersAndBalances[1];

			assert.equal(holders[0], accounts[1], "holders is not equal");
			assert.equal(new BigNumber(balances[0]).valueOf(), new BigNumber('1000').mul(precision).valueOf(), "balances is not equal");

			tokenHoldersAndBalances = await rft.ftHoldersBalances(tokenIdSecond, 0, 1);
			holders = tokenHoldersAndBalances[0];
			balances = tokenHoldersAndBalances[1];

			assert.equal(holders[0], accounts[2], "holders is not equal");
			assert.equal(new BigNumber(balances[0]), new BigNumber('500').mul(precision).valueOf(), "balances is not equal");

			// cause _indexTo is bigger than holders count
			await rft.ftHoldersBalances(tokenId, 0, 2)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);
		});

		it('should check ftHoldersCount', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;

			let firstTokenHoldersCount = await rft.ftHoldersCount(tokenId);
			assert.equal(new BigNumber(firstTokenHoldersCount).valueOf(), 1, "holders count is not equal");

			let secondTokenHoldersCount = await rft.ftHoldersCount(tokenIdSecond);
			assert.equal(new BigNumber(secondTokenHoldersCount).valueOf(), 1, "holders count is not equal");
		});

		it('should check ftAddress', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;

			let firstFungibleAddress = await rft.ftAddress(tokenId);
			assert.equal(firstFungibleAddress, firstFungible, "fungibleToken address is not equal");

			let secondFungibleAddress = await rft.ftAddress(tokenIdSecond);
			assert.equal(secondFungibleAddress, secondFungible, "fungibleToken address is not equal");
		})
	});

	describe('Check NFT token flow', () => {

		const name = "toki_1";
		const symbol = "TK1";
		const decimals = 18;
		const tokenOwner = accounts[1];
		const fungibleTokenSupply = new BigNumber('1000').mul(precision);
		const tokenId = 0;
		let fungible;

		beforeEach(async () => {
			await rft.mint(
				name,
				symbol,
				decimals,
				tokenOwner,
				fungibleTokenSupply,
				{from: owner}
			).then(Utils.receiptShouldSucceed);
			fungible = await rft.ftAddresses.call(0);
		})

		it('should check balanceOf', async () => {
			let balance = await rft.balanceOf(tokenOwner);
			assert.equal(new BigNumber(balance).valueOf(), 1, "balance is not equal");
		});

		it('should check ownerOf', async () => {
			let receiver = accounts[2]
			let ownerOfNFT = await rft.ownerOf(tokenId);
			assert.equal(ownerOfNFT, tokenOwner, "ownerOfNFT is not equal");
		
			await rft.transferFrom(
				tokenOwner,
				receiver,
				tokenId,
				{from: tokenOwner}
			);

			ownerOfNFT = await rft.ownerOf(tokenId);
			assert.equal(ownerOfNFT, receiver, "ownerOfNFT is not equal");
		});

		it('should check approve and getApproved', async () => {
			let approvalAddress = accounts[3];

			await rft.approve(approvalAddress, tokenId, {from: tokenOwner})
				.then(Utils.receiptShouldSucceed);

			let checkApproval = await rft.getApproved(tokenId);
			assert.equal(checkApproval, approvalAddress, "approval address is not equal");
		});

		it('should check setApprovalForAll and isApprovedForAll', async () => {
			let approvalAddress = accounts[3];

			await rft.setApprovalForAll(tokenOwner, true, {from: tokenOwner})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await rft.setApprovalForAll(approvalAddress, true, {from: tokenOwner})
				.then(Utils.receiptShouldSucceed);

			let isApproved = await rft.isApprovedForAll(tokenOwner, approvalAddress);
			assert.equal(isApproved, true, "isApprovedForAll is not equal");
		});

		it('should check transferFrom', async () => {
			let approvalAddress = accounts[3];
			let receiver = accounts[4];

			await rft.transferFrom(tokenOwner, receiver, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await rft.approve(approvalAddress, tokenId, {from: tokenOwner})
				.then(Utils.receiptShouldSucceed);

			await rft.transferFrom(tokenOwner, approvalAddress, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await rft.transferFrom(tokenOwner, approvalAddress, tokenId, {from: accounts[2]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await rft.transferFrom(tokenOwner, receiver, tokenId, {from: approvalAddress})
				.then(Utils.receiptShouldSucceed);

			let balanceOf = await rft.balanceOf(receiver);
			assert.equal(new BigNumber(balanceOf).valueOf(), 1, "balanceOf is not equal");
		});

		it('should check safeTransferFrom', async () => {
			let approvalAddress = accounts[3];
			let receiver = accounts[4];

			await rft.safeTransferFrom(tokenOwner, receiver, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await rft.approve(approvalAddress, tokenId, {from: tokenOwner})
				.then(Utils.receiptShouldSucceed);

			await rft.safeTransferFrom(tokenOwner, approvalAddress, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await rft.safeTransferFrom(tokenOwner, approvalAddress, tokenId, {from: accounts[2]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await rft.safeTransferFrom(tokenOwner, receiver, tokenId, {from: approvalAddress})
				.then(Utils.receiptShouldSucceed);

			let balanceOf = await rft.balanceOf(receiver);
			assert.equal(new BigNumber(balanceOf).valueOf(), 1, "balanceOf is not equal");
		});

		it('should check tokenURI', async () => {
			let uri = await rft.tokenURI(tokenId);
			assert.equal(uri, "", "uri is not equal");
		});
	});
});