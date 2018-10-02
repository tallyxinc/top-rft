pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './IERC1358FTFull.sol';
import './IERC1358NFTFull.sol';

/**
 * @title ERC-1358 full interface
 * This interface implementing functionality to create ERC-1358 token
 * that has Non-Fungible structure and its value is supplied with Fungible Token
 * (ERC-20 compatible)
 */
contract IERC1358 is IERC1358NFTFull {
    using SafeMath for uint256;

    /**
     * @dev Mint Non-Fungible Token and create Fungible token that will supply its value
     * @param name Name for a Fungible Token
     * @param symbol Symbol abbreviated from Fungible Token name
     * @param decimals Precision for token amount calculations
     * @param tokenOwner Address of NFT and FT token owner
     * @param fungibleTokenSupply Total token amount for FT
     */
    function createToken(
        string name,
        string symbol,
        uint256 decimals,
        address tokenOwner, 
        uint256 fungibleTokenSupply
    ) public;

    /**
     * @dev Get FT token balance of NFT holder
     * @param _tokenId Unique identifier of Non-Fungible Token
     * @param _holder ETH Address of NFT holder
     */
    function getFungibleTokenHolderBalance(
        uint256 _tokenId,
        address _holder
    ) public view returns (uint256 _value);

    /**
     * @dev Returns array of token holders ETH addresses by NFT id
     * @param _tokenId Unique identifier of Non-Fungible Token
     */
    function getFungibleTokenHolders(uint256 _tokenId) 
        public view returns (address[] _holders);

    /**
     * @dev Returns array of NFT token holders FT balances
     * @param _tokenId Unique identifier of Non-Fungible Token
     */
    function getFungibleTokenHolderBalances(uint256 _tokenId) 
        public view returns (address[] _holders, uint256[] _balances);

    /**
     * @dev Returns ETH address of FT by NFT id it supplies
     * @param _tokenId Unique identifier of Non-Fungible Token
     */
    function getFungibleTokenAddress(uint256 _tokenId) 
        public view returns (IERC1358FTFull _erc20CompatibleInterface);
}



