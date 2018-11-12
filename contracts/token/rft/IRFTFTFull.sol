pragma solidity ^0.4.24;

import './IRFTFT.sol';
import './IRFTFTMetadata.sol';
import './IRFTFTEnumerable.sol';

/**
 * @title RFT Fungible Token full interface (ERC-20 compatible)
 * @notice Full interface for ERC-20 compatible Token 
 */
contract IRFTFTFull is IRFTFT, IRFTFTMetadata, IRFTFTEnumerable {}