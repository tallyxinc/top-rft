pragma solidity ^0.4.24;

import './ERC1358FT.sol';
import './ERC1358.sol';
import './ERC1358FTMetadata.sol';
import './ERC1358FTEnumerable.sol';

contract ERC1358FTFull is ERC1358FT, ERC1358FTMetadata, ERC1358FTEnumerable {
    /**
     * @dev Constructor for ERC1358FT full implementation contract
     * @param name Name for FT
     * @param symbol Symbol for FT
     * @param decimals Precision amount for FT
     * @param totalSupply Max token supply ofr FT
     * @param nftAddress Address of main NFT contract
     * @param initialTokenId Unique identifier of dependent NFT
     * @param owner Address of FT owner
     */
	constructor (
		string name,
		string symbol,
		uint256 decimals,
		uint256 totalSupply,
		address nftAddress,
		uint256 initialTokenId,
        address owner
	)
		public 
		ERC1358FTMetadata(
			name,
			symbol,
			decimals
		)
		ERC1358FTEnumerable(
			totalSupply,
			nftAddress,
			initialTokenId,
            owner
		) 
	{
		
	}

    /** 
     * @dev Batch transfer for FT
     * @param _receivers Array of token receivers 
     * @param _values Array of token values
     */
    function batchTransfer(
        address[] _receivers,
        uint256[] _values 
    ) 
        public
        returns (bool)
    {
        require(_receivers.length == _values.length);
        for (uint256 i = 0; i < _receivers.length; i++) {
            require(transfer(_receivers[i], _values[i]) == true);
        }
        return true;
    }

    /** 
     * @dev Overrided transfer function, to transfer function
     * @param _to Address of token receiver
     * @param _amount Token amount to transfer
     */
	function transfer(
        address _to,
        uint256 _amount
    ) 
        public 
        returns (bool) 
    {
        require(tokenHolders[msg.sender] == true);
        require(super.transfer(_to, _amount) == true);
        if (tokenHolders[_to] == false) {
            tokenHolders[_to] = true;
            tokenHoldersRegistry.push(_to);
        }
        return true;
    }

    /**
     * @dev Overrided transferFrom function, to transferFrom function
     * @param _from Address of token sender
     * @param _to Address of token receiver
     * @param _amount Token amount to transfer
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
        public
        returns (bool) 
    {
        require(tokenHolders[_from] == true);
        require(super.transferFrom(_from, _to, _amount) == true);
        if (tokenHolders[_to] == false) {
            tokenHolders[_to] = true;
            tokenHoldersRegistry.push(_to);
        }
        return true;
    }
}