pragma solidity ^0.4.24;

import './ERC1358FT.sol';

contract ERC1358FTMetadata is ERC1358FT {
    // Name for FT (notice: Name is not unique)
    string internal _name;
    // Symbol for FT (notice: Symbol is abbreviated from name and is not unique to)
    string internal _symbol;
    // Amount of precision (notice: by default 18)
    uint256 internal _decimals;

    /**
     * @dev Constructor for ERC-1358 contract with Metadata extension
     * @param name Name for FT
     * @param symbol Symbol for FT
     * @param decimals Precision for FT
     */ 
    constructor (
        string name,
        string symbol,
        uint256 decimals
    ) public {
        require(decimals > 0);
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
    }

    /**
     * @dev Return name of FT
     */
    function name() public view returns (string) {
        return _name;
    }

    /**
     * @dev Return symbol of FT
     */ 
    function symbol() public view returns (string) {
        return _symbol;
    }

    /**
     * @dev Return decimals precision of FT
     */
    function decimals() public view returns (uint256) {
        return _decimals;
    }
}