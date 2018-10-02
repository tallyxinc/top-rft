pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/introspection/ERC165.sol';
import './ERC1358NFT.sol';

contract ERC1358NFTEnumerable is ERC165, ERC1358NFT {

	// Mapping from Address of NFT holder to a set of his NFTs
	mapping (address => uint256[]) internal _ownedTokens;

	// Mapping from owned NFT unique identifiers to their position in array
	mapping (uint256 => uint256) internal _ownedTokensIndex;

	// Array of all NFTs
	uint256[] public _allTokens;

	// Mapping from NFT unique identifiers to their position in array
	mapping (uint256 => uint256) internal _allTokensIndex;

	// InterfaceId for ERC-1358 Enumerable contract
	bytes4 private constant _InterfaceId_ERC1358NFTEnumerable = 0x780e9d63;

	/**
	 * @dev Constructor for ERC-1358 NFT Enumarable contract
	 */
	constructor() public {
		_registerInterface(_InterfaceId_ERC1358NFTEnumerable);
	}

	/**
     * @dev Returns specified NFT of holder by index in array
     * @param _owner Address of Non-Fungible token  holder
     * @param _index Index of NFT in owners owned NFT's array
     */
	function tokenOfOwnerByIndex(
		address _owner,
		uint256 _index
	)
		public 
		view 
		returns (uint256) 
	{
		require(_index < balanceOf(_owner));
		return _ownedTokens[_owner][_index];
	}

    /**
     * @dev Returns total amount of NFTs
     */
	function totalSupply() public view returns (uint256) {
		return _allTokens.length;
	}

    /**
     * @dev Finds NFT by its index in all NFT's array
     * @param _index Index of Non-Fungible token 
     */
	function tokenByIndex(uint256 _index) 
		public 
		view 
		returns (uint256) 
	{
		require (_index < totalSupply());
		return _allTokens[_index];
	}

    /**
     * @dev Transfers ownership from one token holder to another
     * @param _to Address of new Non-Fungible token holder
     * @param _tokenId Unique identifier of transferable NFT
     */
	function _addTokenTo(
		address _to,
		uint256 _tokenId
	) internal {
		super._addTokenTo(_to, _tokenId);
		uint256 _length = _ownedTokens[_to].length;
		_ownedTokens[_to].push(_tokenId);
		_ownedTokensIndex[_tokenId] = _length;
	}

    /**
     * @dev Discards ownership for specified token holder, making NFT unassigned
     * @param _from Address of Non-Fungible token holder who will lost ownership for it
     * @param _tokenId Unique identifier for NFT
     */
	function _removeTokenFrom(
		address _from,
		uint256 _tokenId
	) internal {
		super._removeTokenFrom(_from, _tokenId);

		uint256 _tokenIndex = _ownedTokensIndex[_tokenId];
		uint256 _lastTokenIndex = _ownedTokens[_from].length.sub(1);
		uint256 _lastToken = _ownedTokens[_from][_lastTokenIndex];

		_ownedTokens[_from][_tokenIndex] = _lastToken;
		_ownedTokens[_from].length--;

		_ownedTokensIndex[_tokenId] = 0;
		_ownedTokensIndex[_lastToken] = _tokenIndex;
	}

    /** 
     * @dev Mint new NFT for specified address
     * @param _to Address of new Non-Fungible token holder
     * @param _tokenId Unique identifier of NFT
     */
	function _mint(
		address _to,
		uint256 _tokenId
	) internal {
		super._mint(_to, _tokenId);

		_allTokensIndex[_tokenId] = _allTokens.length;
		_allTokens.push(_tokenId);
	}

    /**
     * @dev Burn Non-Fungible token for specified NFT holder
     * @param _owner Address of Non-Fungible token holder
     * @param _tokenId Unique identifier of Non-Fungible token
     */
	function _burn(
		address _owner,
		uint256 _tokenId
	) internal {
		super._burn(_owner, _tokenId);

		uint256 _tokenIndex = _allTokensIndex[_tokenId];
		uint256 _lastTokenIndex = _allTokens.length.sub(1);
		uint256 _lastToken = _allTokens[_lastTokenIndex];

		_allTokens[_tokenIndex] = _lastToken;
		_allTokens[_lastTokenIndex] = 0;

		_allTokens.length--;
		_allTokensIndex[_tokenId] = 0;
		_allTokensIndex[_lastToken] = _tokenIndex;
	}
}