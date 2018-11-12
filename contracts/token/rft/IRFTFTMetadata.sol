pragma solidity ^0.4.24;

import './IRFTFT.sol';

/**
 * @title RFT Fungible Token interface (ERC-20 compatible)
 * @notice Optional metadata interface for ERC-20 compatible Token
 */
contract IRFTFTMetadata is IRFTFT {
    /**
     * @notice Returns name of RFT Fungible Token (ERC-20 compatible)
     * Note: In Ethereum blockchain token name is non-unique
     */
    function name() public view returns (string);

    /**
     * @notice Returns symbol of RFT Fungible Token (ERC-20 compatible)
     * Note: Symbol is abbreviated from name and the same as name it's non-unique
     */
    function symbol() public view returns (string);

    /**
     * @notice Returns decimals of RFT Fungible Token (ERC-20 compatible)
     * Note: by default should be 18
     */
    function decimals() public view returns (uint256);
}