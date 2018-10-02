pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol'; 
import './ERC1358NFTFull.sol';
import './ERC1358FTFull.sol';

contract ERC1358 is ERC1358NFTFull, Ownable {

    // Mapping from Non-Fungible Token unique identifier to Fungible Token address
    mapping (uint256 => address) public ftAddresses;
    
    // Mapping from address of token owner to Fungible Token address
    mapping (address => address) public ftOwners;

    // Mapping from Non-Fungible unique identifier to it's value in Fungible tokens
    mapping (uint256 => uint256) public nftValues;

    // Mapping from Address to status 
    mapping (address => bool) public changeAllowAgents;

    // Array of all Fungible tokens
    address[] public fungibleTokens;

    /**
     * @dev Constructor for ERC-1358 main contract
     * @param name Name for a set of NFTs
     * @param symbol Symbol for a set of NFTs
     */
    constructor (
        string name,
        string symbol
    ) 
        public
        ERC1358NFTFull(name, symbol) {} 

    /** 
     * @dev Modifier that checks is msg.sender is contract owner or changeAllowAgents
     */
    modifier isChangeAllowedAgent() {
        require(true == changeAllowAgents[msg.sender] || 
            msg.sender == owner);
         _;
    }

    /** 
     * @dev Overrided mint function, mint NFT for specified address
     * @param _to Address of NFT owner
     * @param _tokenId Unique identifier of NFT
     */
    function mint(
        address _to,
        uint256 _tokenId
    )   
        public
        isChangeAllowedAgent
        returns (bool)
    {
        super._mint(_to, _tokenId);
        return true;
    }

    /** 
     * @dev Overrided burn function, burn NFT from specified address
     * @param _owner Address from which NFT will be burned
     * @param _tokenId Unique identifier of NFT
     */
    function burn(
        address _owner,
        uint256 _tokenId
    ) 
        public
        isChangeAllowedAgent
        returns (bool)
    {
        super._burn(_owner, _tokenId);
        return true;
    }

    /** 
     * @dev Entry point to ERC1358 main flow, created NFT, which is supplid by FT
     * @param name Name for FT
     * @param symbol Symbol for FT
     * @param decimals Precision amount for FT
     * @param tokenOwner Address of FT owner
     * @param fungibleTokenSupply Max token supply for FT
     */
    function createFungible(
        string name,
        string symbol,
        uint256 decimals,
        address tokenOwner,
        uint256 fungibleTokenSupply
    ) 
        public 
        onlyOwner 
    {
        require (decimals > 0);
        require (tokenOwner != address(0));
        require (fungibleTokenSupply > 0);

        uint256 tokenId = _allTokens.length;

        ERC1358FTFull fungibleToken = new ERC1358FTFull(
            name,
            symbol,
            decimals,
            fungibleTokenSupply,
            address(this),
            tokenId,
            tokenOwner
        );

        fungibleTokens.push(fungibleToken);
        changeAllowAgents[fungibleToken] = true;
        ftAddresses[tokenId] = fungibleToken;
        ftOwners[tokenOwner] = fungibleToken;
        nftValues[tokenId] = fungibleTokenSupply;

        require(mint(tokenOwner, tokenId) == true);
    }

    /**
     * @dev Function that updates value of NFT
     * @param _tokenId Unique identifier of NFT
     * @param _newValue New value for NFT
     */
    function updateNonFungibleValue(
        uint256 _tokenId,
        uint256 _newValue
    ) 
        public 
        isChangeAllowedAgent()
    {
        require(nftValues[_tokenId] >= _newValue);
        nftValues[_tokenId] = _newValue;
    }

    /**
     * @dev Returns NFT value in equiv of FTs
     * @param _tokenId unique identifier of NFT
     */
    function getNonFungibleValue(
        uint256 _tokenId
    ) 
        public
        view 
        returns (uint256 _value)
    {
        _value = nftValues[_tokenId];
    }

    /** 
     * @dev Returns FT holder token balance
     * @param _tokenId Unique identifier of NFT, which is supplied by FT
     * @param _holder Address of FT holder
     */
    function getFungibleTokenHolderBalance(
        uint256 _tokenId,
        address _holder
    ) 
        public 
        view 
        returns (uint256 _value) 
    {
        address fungibleTokenAddress = ftAddresses[_tokenId];
        ERC1358FTFull fungibleToken = ERC1358FTFull(fungibleTokenAddress);
        _value = fungibleToken.balanceOf(_holder);
    }

    /** 
     * @dev Returns addresses array of all FT holders
     * @param _tokenId Unique identifier of NFT, which is supplied by FT
     */
    function getFungibleTokenHolders(uint256 _tokenId) 
        public
        view 
        returns (address[] _holders) 
    {
        address fungibleTokenAddress = ftAddresses[_tokenId];
        ERC1358FTFull fungibleToken = ERC1358FTFull(fungibleTokenAddress);
        _holders = fungibleToken.getTokenHolders();
    } 

    /**
     * @dev Returns addresses and token balances array of all FT holders
     * @param _tokenId Unique identifier of NFT, which is supplied by FT
     */
    function getFungibleTokenHolderBalances(uint256 _tokenId) 
        public
        view
        returns (address[] _holders, uint256[] _balances) 
    {
        _holders = getFungibleTokenHolders(_tokenId);
        address fungibleTokenAddress = ftAddresses[_tokenId];
        ERC1358FTFull fungibleToken = ERC1358FTFull(fungibleTokenAddress);
        _balances = fungibleToken.getTokenHoldersBalances();
    }

    /**
     * @dev Returns address of FT by id of NFT it linked to
     * @param _tokenId Unique identifier of NFT, which is supplied by FT
     */
    function getFungibleTokenAddress(uint256 _tokenId)
        public
        view
        returns (ERC1358FTFull _erc20CompatibleInterface) 
    {
        return ERC1358FTFull(ftAddresses[_tokenId]);
    } 
}