const ERC1358 = artifacts.require('token/ERC1358');
const abi = require('ethereumjs-abi');
const BigNumber = require('bignumber.js');
const Utils = require('./utils');

let precision = new BigNumber("1000000000000000000");

contract('ERC1358', accounts => {
	
	let erc1358, ft1Address;
	let owner = accounts[0];
	let name = "tallyx_0";
	let symbol = "topp";

	beforeEach(async () => {
		erc1358 = await ERC1358.new(name, symbol, {from: owner});
	});

	it('should check metadata', async () => {
		const _name = await erc1358.name();
		assert.equal(_name, name, "name is not equal");
		const _symbol = await erc1358.symbol();
		assert.equal(_symbol, symbol, "symbol is not equal");
	});

	it('should not create Fungible Token cause decimals == 0', async () => {
		let name = "toki_1";
		let symbol = "TK1";
		let decimals = 0;
		let tokenOwner = accounts[1];
		let fungibleTokenSupply = new BigNumber('1000').mul(precision);
		
		await erc1358.createFungible(
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
		
		await erc1358.createFungible(
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
		
		await erc1358.createFungible(
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
		
		await erc1358.createFungible(
			name,
			symbol,
			decimals,
			tokenOwner,
			fungibleTokenSupply,
			{from: owner}
		).then(Utils.receiptShouldSucceed);

		let ftAddress = await erc1358.ftAddresses.call(new BigNumber('0'));
		console.log('Fungible token address: ' + ftAddress);
		ft1Address = ftAddress;

		let nftValue = await erc1358.nftValues.call(new BigNumber('0'));
		assert.equal(new BigNumber(nftValue).valueOf(), fungibleTokenSupply.valueOf(), "nftValue is not equal");

		let ftOfOwner = await erc1358.ftOwners.call(tokenOwner);
		assert.equal(ftOfOwner, ftAddress, "fungibleToken of owner is not equal");

		let fungibleTokenFromArray = await erc1358.fungibleTokens.call(new BigNumber('0'));
		assert.equal(fungibleTokenFromArray, ftAddress, "fungibleToken address from array is not equal");
	});

	it('should check mint function', async () => {
		let to = accounts[2];
		let tokenId = 100;

		await erc1358.mint(to, tokenId, {from: accounts[3]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		await erc1358.mint(to, tokenId, {from: to})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		await erc1358.mint(to, tokenId, {from: owner})
			.then(Utils.receiptShouldSucceed);

		let balanceOf = await erc1358.balanceOf(to);
		assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('1').valueOf(), "balanceOf is not equal");
		
		let ownerOf = await erc1358.ownerOf(tokenId);
		assert.equal(ownerOf, to, "ownerOf is not equal");
		
		let allTokens = await erc1358._allTokens.call(0);
		assert.equal(new BigNumber(allTokens).valueOf(), tokenId, "allTokens is not equal");
		
		let tokenOfOwnerByIndex = await erc1358.tokenOfOwnerByIndex(to, 0);
		assert.equal(new BigNumber(tokenOfOwnerByIndex).valueOf(), tokenId, "tokenOfOwnerByIndex is not equal");

		let tokenByIndex = await erc1358.tokenByIndex(0);
		assert.equal(new BigNumber(tokenByIndex).valueOf(), tokenId, "tokenByIndex is not equal");
	});

	it('should check burn function', async () => {
		let to = accounts[2];
		let tokenId = 100;
		let tokenIdSecond = 200;

		await erc1358.mint(to, tokenId, {from: owner})
			.then(Utils.receiptShouldSucceed);

		let balanceOf = await erc1358.balanceOf(to);
		assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('1').valueOf(), "balanceOf is not equal");

		let tokenByIndex = await erc1358.tokenOfOwnerByIndex(to, 0);
		assert.equal(new BigNumber(tokenByIndex).valueOf(), tokenId, "tokenOfOwnerByIndex is not equal");

		await erc1358.mint(to, tokenIdSecond, {from: owner})
			.then(Utils.receiptShouldSucceed);

		tokenByIndex = await erc1358.tokenOfOwnerByIndex(to, 1);
		assert.equal(new BigNumber(tokenByIndex).valueOf(), tokenIdSecond, "tokenOfOwnerByIndex is not equal");

		balanceOf = await erc1358.balanceOf(to);
		assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('2').valueOf(), "balanceOf is not equal");

		await erc1358.burn(to, tokenId, {from: accounts[3]})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		await erc1358.burn(to, tokenId, {from: to})
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);

		await erc1358.burn(to, tokenId, {from: owner})
			.then(Utils.receiptShouldSucceed);

		balanceOf = await erc1358.balanceOf(to);
		assert.equal(new BigNumber(balanceOf).valueOf(), new BigNumber('1').valueOf(), "balanceOf is not equal");		

		tokenByIndex = await erc1358.tokenOfOwnerByIndex(to, 0);
		assert.equal(new BigNumber(tokenByIndex).valueOf(), tokenIdSecond, "tokenOfOwnerByIndex is not equal");

		await erc1358.ownerOf(tokenId)
			.then(Utils.receiptShouldFailed)
			.catch(Utils.catchReceiptShouldFailed);
	});

	describe('Check updateNonFungibleValue | getNonFungibleValue | getFungibleTokenHolderBalance' + 
		'| getFungibleTokenHolders | getFungibleTokenHolderBalances | getFungibleTokenAddress', () => {

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
		
			await erc1358.createFungible(
				name_1,
				symbol_1,
				decimals,
				tokenOwner_1,
				fungibleTokenSupply_1,
				{from: owner}
			).then(Utils.receiptShouldSucceed);
			firstFungible = await erc1358.ftAddresses.call(0);

			await erc1358.createFungible(
				name_2,
				symbol_2,
				decimals,
				tokenOwner_2,
				fungibleTokenSupply_2,
				{from: owner}
			).then(Utils.receiptShouldSucceed);
			secondFungible = await erc1358.ftAddresses.call(1);
		});

		it('should check updateNonFungibleValue', async () => {
			let tokenId = 0;
			let newValue = new BigNumber('999').valueOf();
			let newValueSecond = new BigNumber('998').valueOf();
			let uncorrectNewValue = new BigNumber('1000').valueOf();
			
			await erc1358.updateNonFungibleValue(tokenId, newValue, {from: accounts[3]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.updateNonFungibleValue(tokenId, uncorrectNewValue, {from: accounts[1]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.updateNonFungibleValue(tokenId, newValue, {from: owner})
				.then(Utils.receiptShouldSucceed);

			await erc1358.updateNonFungibleValue(tokenId, newValueSecond, {from: owner})
				.then(Utils.receiptShouldSucceed);

			let nftValue = await erc1358.nftValues.call(tokenId);
			assert.equal(new BigNumber(nftValue).valueOf(), newValueSecond, "nftValue is not equal");
		});

		it('should check getNonFungibleValue', async () => {
			let tokenId = 0;
			let newValue = new BigNumber('500').valueOf();
			let newValueSecond = new BigNumber('100').valueOf();
			
			await erc1358.updateNonFungibleValue(tokenId, newValue, {from: owner})
				.then(Utils.receiptShouldSucceed);

			let nftValue = await erc1358.getNonFungibleValue(tokenId);
			assert.equal(new BigNumber(nftValue).valueOf(), newValue, "nftValue is not equal");

			await erc1358.updateNonFungibleValue(tokenId, newValueSecond, {from: owner})
				.then(Utils.receiptShouldSucceed);

			nftValue = await erc1358.getNonFungibleValue(tokenId);
			assert.equal(new BigNumber(nftValue).valueOf(), newValueSecond, "nftValue is not equal");
		});

		it('should check getFungibleTokenHolderBalance', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;
			let holder = accounts[1];
			let holderSecond = accounts[2];

			let balanceOfHolder = await erc1358.getFungibleTokenHolderBalance(tokenId, holder);
			assert.equal(new BigNumber(balanceOfHolder).valueOf(), new BigNumber('1000').mul(precision).valueOf(), "balanceOfHolder is not equal");

			balanceOfHolder = await erc1358.getFungibleTokenHolderBalance(tokenIdSecond, holderSecond);
			assert.equal(new BigNumber(balanceOfHolder).valueOf(), new BigNumber('500').mul(precision).valueOf(), "balanceOfHolder is not equal");
		});

		it('should check getFungibleTokenHolders', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;

			let tokenHolders = await erc1358.getFungibleTokenHolders(tokenId);
			assert.equal(tokenHolders[0], accounts[1], "tokenHolders is not equal");
			
			tokenHolders = await erc1358.getFungibleTokenHolders(tokenIdSecond);
			assert.equal(tokenHolders[0], accounts[2], "tokenHolders is not equal");
		});

		it('should check getFungibleTokenHolderBalances', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;

			let tokenHoldersAndBalances = await erc1358.getFungibleTokenHolderBalances(tokenId);
			let holders = tokenHoldersAndBalances[0];
			let balances = tokenHoldersAndBalances[1];

			assert.equal(holders[0], accounts[1], "holders is not equal");
			assert.equal(new BigNumber(balances[0]).valueOf(), new BigNumber('1000').mul(precision).valueOf(), "balances is not equal");

			tokenHoldersAndBalances = await erc1358.getFungibleTokenHolderBalances(tokenIdSecond);
			holders = tokenHoldersAndBalances[0];
			balances = tokenHoldersAndBalances[1];

			assert.equal(holders[0], accounts[2], "holders is not equal");
			assert.equal(new BigNumber(balances[0]), new BigNumber('500').mul(precision).valueOf(), "balances is not equal");
		})

		it('should check getFungibleTokenAddress', async () => {
			let tokenId = 0;
			let tokenIdSecond = 1;

			let firstFungibleAddress = await erc1358.getFungibleTokenAddress(tokenId);
			assert.equal(firstFungibleAddress, firstFungible, "fungibleToken address is not equal");

			let secondFungibleAddress = await erc1358.getFungibleTokenAddress(tokenIdSecond);
			assert.equal(secondFungibleAddress, secondFungible, "fungibleToken address is not equal");
		})
	});

	describe('Check NFT token flow', () => {
		beforeEach(async () => {
			let tokenId = 100;
			let tokenIdSecond = 200;

			let tokenOwner = accounts[1];
			let tokenOwnerSecond = accounts[2];

			await erc1358.mint(tokenOwner, tokenId)
				.then(Utils.receiptShouldSucceed);
			
			await erc1358.mint(tokenOwnerSecond, tokenIdSecond)
				.then(Utils.receiptShouldSucceed);
		})

		it('should check balanceOf', async () => {
			let tokenOwner = accounts[1];
			let tokenId = 300;
			let balance = await erc1358.balanceOf(tokenOwner);
			assert.equal(new BigNumber(balance).valueOf(), 1, "balance is not equal");
			await erc1358.mint(tokenOwner, tokenId)
				.then(Utils.receiptShouldSucceed);
			balance = await erc1358.balanceOf(tokenOwner);
			assert.equal(new BigNumber(balance).valueOf(), 2, "balance is not equal");
		});

		it('should check ownerOf', async () => {
			let tokenId = 100;
			let tokenIdSecond = 200;
			let newTokenId = 300;
			let ownerOfNewToken = accounts[1];

			await erc1358.mint(ownerOfNewToken, newTokenId)
				.then(Utils.receiptShouldSucceed);

			let ownerOfNFT = await erc1358.ownerOf(tokenId);
			assert.equal(ownerOfNFT, accounts[1], "ownerOfNFT is not equal");
			ownerOfNFT = await erc1358.ownerOf(tokenIdSecond);
			assert.equal(ownerOfNFT, accounts[2], "ownerOfNFT is not equal");
			ownerOfNFT = await erc1358.ownerOf(newTokenId);
			assert.equal(ownerOfNFT, accounts[1], "ownerOfNFT is not equal");

			await erc1358.transferFrom(
				accounts[1],
				accounts[2],
				newTokenId,
				{from: accounts[1]}
			);

			ownerOfNFT = await erc1358.ownerOf(newTokenId);
			assert.equal(ownerOfNFT, accounts[2], "ownerOfNFT is not equal");
		});

		it('should check approve and getApproved', async () => {
			let tokenId = 100;
			let tokenIdSecond = 200;

			let firstTokenOwner = await erc1358.ownerOf(tokenId);
			let firstTokenApproval = accounts[3];
			await erc1358.approve(firstTokenApproval, tokenId, {from: firstTokenOwner})
				.then(Utils.receiptShouldSucceed);

			let secondTokenOwner = await erc1358.ownerOf(tokenIdSecond);
			let secondTokenApproval = accounts[3];

			await erc1358.approve(secondTokenApproval, tokenIdSecond, {from: firstTokenOwner})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);			

			await erc1358.approve(secondTokenOwner, tokenIdSecond, {from: secondTokenOwner})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.approve(secondTokenApproval, tokenIdSecond, {from: secondTokenOwner})
				.then(Utils.receiptShouldSucceed);

			let checkApproval = await erc1358.getApproved(tokenId);
			assert.equal(checkApproval, firstTokenApproval, "firstTokenApproval is not equal");
			checkApproval = await erc1358.getApproved(tokenIdSecond);
			assert.equal(checkApproval, secondTokenApproval, "secondTokenApproval is not equal");
		});

		it('should check setApprovalForAll and isApprovedForAll', async () => {
			let tokenId = 300;
			let tokenIdSecond = 400;
			let tokenOwner = accounts[1];
			let approval = accounts[3];

			await erc1358.mint(tokenOwner, tokenId)
				.then(Utils.receiptShouldSucceed);

			await erc1358.mint(tokenOwner, tokenIdSecond)
				.then(Utils.receiptShouldSucceed);

			await erc1358.setApprovalForAll(tokenOwner, true, {from: tokenOwner})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.setApprovalForAll(approval, true, {from: tokenOwner})
				.then(Utils.receiptShouldSucceed);

			let isApproved = await erc1358.isApprovedForAll(tokenOwner, approval);
			assert.equal(isApproved, true, "isApprovedForAll is not equal");
		});

		it('should check transferFrom', async () => {
			let tokenId = 100;
			let newTokenId = 300;
			let newSecondTokenId = 400;

			let firstTokenOwner = accounts[1];
			let approval = accounts[3];

			await erc1358.mint(firstTokenOwner, newTokenId)
				.then(Utils.receiptShouldSucceed);
			await erc1358.mint(firstTokenOwner, newSecondTokenId)
				.then(Utils.receiptShouldSucceed);

			await erc1358.transferFrom(firstTokenOwner, approval, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.approve(approval, tokenId, {from: firstTokenOwner})
				.then(Utils.receiptShouldSucceed);

			await erc1358.transferFrom(firstTokenOwner, approval, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.transferFrom(firstTokenOwner, approval, tokenId, {from: accounts[2]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.transferFrom(firstTokenOwner, approval, tokenId, {from: approval})
				.then(Utils.receiptShouldSucceed);

			let balanceOf = await erc1358.balanceOf(approval);
			assert.equal(new BigNumber(balanceOf).valueOf(), 1, "balanceOf is not equal");

			await erc1358.transferFrom(firstTokenOwner, approval, newTokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.transferFrom(firstTokenOwner, approval, newSecondTokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.setApprovalForAll(approval, true, {from: firstTokenOwner})
				.then(Utils.receiptShouldSucceed);

			await erc1358.transferFrom(firstTokenOwner, approval, newTokenId, {from: accounts[2]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.transferFrom(firstTokenOwner, approval, newTokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.transferFrom(firstTokenOwner, approval, newTokenId, {from: approval})
				.then(Utils.receiptShouldSucceed);

			balanceOf = await erc1358.balanceOf(approval);
			assert.equal(new BigNumber(balanceOf).valueOf(), 2, "balanceOf is not equal");

			await erc1358.transferFrom(firstTokenOwner, approval, newSecondTokenId, {from: accounts[2]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.transferFrom(firstTokenOwner, approval, newSecondTokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.transferFrom(firstTokenOwner, approval, newSecondTokenId, {from: approval})
				.then(Utils.receiptShouldSucceed);

			balanceOf = await erc1358.balanceOf(approval);
			assert.equal(new BigNumber(balanceOf).valueOf(), 3, "balanceOf is not equal");

			balanceOf = await erc1358.balanceOf(firstTokenOwner);
			assert.equal(new BigNumber(balanceOf).valueOf(), 0, "balanceOf is not equal");
		});

		it('should check safeTransferFrom', async () => {
			let tokenId = 100;
			let newTokenId = 300;

			let firstTokenOwner = accounts[1];
			let approval = accounts[3];

			let balanceOf = await erc1358.balanceOf(firstTokenOwner);
			assert.equal(new BigNumber(balanceOf).valueOf(), 1, "balanceOf is not equal");

			await erc1358.mint(firstTokenOwner, newTokenId)
				.then(Utils.receiptShouldSucceed);

			balanceOf = await erc1358.balanceOf(firstTokenOwner);
			assert.equal(new BigNumber(balanceOf).valueOf(), 2, "balanceOf is not equal");

			await erc1358.approve(approval, tokenId, {from: firstTokenOwner})
				.then(Utils.receiptShouldSucceed);

			await erc1358.safeTransferFrom(firstTokenOwner, approval, tokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.safeTransferFrom(firstTokenOwner, approval, tokenId, {from: accounts[2]})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.safeTransferFrom(firstTokenOwner, approval, tokenId, {from: approval})
				.then(Utils.receiptShouldSucceed);

			balanceOf = await erc1358.balanceOf(firstTokenOwner);
			assert.equal(new BigNumber(balanceOf).valueOf(), 1, "balanceOf is not equal");
			balanceOf = await erc1358.balanceOf(approval);
			assert.equal(new BigNumber(balanceOf).valueOf(), 1, "balanceOf is not equal");

			await erc1358.safeTransferFrom(firstTokenOwner, approval, newTokenId, {from: approval})
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.safeTransferFrom(firstTokenOwner, approval, newTokenId)
				.then(Utils.receiptShouldFailed)
				.catch(Utils.catchReceiptShouldFailed);

			await erc1358.safeTransferFrom(firstTokenOwner, approval, newTokenId, {from: firstTokenOwner})
				.then(Utils.receiptShouldSucceed);

			balanceOf = await erc1358.balanceOf(firstTokenOwner);
			assert.equal(new BigNumber(balanceOf).valueOf(), 0, "balanceOf is not equal");
			balanceOf = await erc1358.balanceOf(approval);
			assert.equal(new BigNumber(balanceOf).valueOf(), 2, "balanceOf is not equal");
		});

		it('should check tokenURI', async () => {
			let tokenId = 100;
			let uri = await erc1358.tokenURI(tokenId);
			assert.equal(uri, "", "uri is not equal");
		});
	});
});