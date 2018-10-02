pragma solidity ^0.4.24;

import './IERC1358FTEnumerable.sol';
import './ERC1358FT.sol';

contract ERC1358FTEnumerable is ERC1358FT {

    // Total tokens supply 
    uint256 internal _totalSupply;

    // Address of main NFT
    address internal _nftAddress;

    // tokenId of NFT, for which this FT is supplier
    uint256 internal _initialTokenId;

    // Mapping from address of token holer to its status
    mapping (address => bool) public tokenHolders;

    // Array of all token holders
    address[] public tokenHoldersRegistry;

    /**
     * @dev Constructor for ERC-1358FT contract with Enumerable extension
     * @param totalSupply Max amount of tokens
     * @param nftAddress Address of main NFT, by which this FT was created
     * @param initialTokenId Unique identifier of NFT linked to this FT
     * @param owner Address of FT token owner
     */
    constructor (
        uint256 totalSupply,
        address nftAddress,
        uint256 initialTokenId,
        address owner
    ) public {
        require(totalSupply > 0);
        require(nftAddress != address(0));
        require(initialTokenId >= 0);
        require(owner != address(0));
        _totalSupply = totalSupply;
        _nftAddress = nftAddress;
        _initialTokenId = initialTokenId;
        _balances[owner] = _totalSupply;
        tokenHolders[owner] = true;
        tokenHoldersRegistry.push(owner);
    }

    /**
     * @dev Returns holders array size
     */
    function holdersRegistryLength() public view returns (uint256) {
        return tokenHoldersRegistry.length;
    }

    /** 
     * @dev Returns address of holder by its index in holders array
     * @param _index Index of holder in array
     */
    function getTokenHolder(uint256 _index) public view returns (address) {
        return tokenHoldersRegistry[_index];
    }

    /**
     * @dev Return array of token holders
     */
    function getTokenHolders() public view returns (address[]) {
        return tokenHoldersRegistry;
    }

    /**
     * @dev Return array of token holders balances
     */
    function getTokenHoldersBalances() public view returns (uint256[]) {
        uint256[] memory holdersBalance = new uint256[](tokenHoldersRegistry.length);

        for (uint256 i = 0; i < tokenHoldersRegistry.length; i++) {
            holdersBalance[i] = balanceOf(tokenHoldersRegistry[i]);
        }
        return holdersBalance;
    }

    /**
     * @dev Return total token supply for this FT 
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns NFT data for this FT, main NFT address and tokenId of dependent NFT 
     */
    function getNFT() public view returns (address, uint256) {
        return (_nftAddress, _initialTokenId);
    }
}