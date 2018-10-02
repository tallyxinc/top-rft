pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './IERC1358FT.sol';

contract ERC1358FT is IERC1358FT {
    using SafeMath for uint256;

    // Mapping of Fungible Token holder balances
    mapping (address => uint256) public _balances;

    // Mapping of Fungible Token allowance
    mapping (address => mapping (address => uint256)) public _allowed;

    // Total supply of Fungible Token 
    uint256 private _totalSupply;

    /**
    * @dev Returns total supply of Fungible Token
    */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
    * @dev Returns Fungible Token balance of specified holder
    * @param _address ETH address of token holder
    */
    function balanceOf(address _address) public view returns (uint256) {
        return _balances[_address];
    }

    /**
    * @dev Transfer specified amount of Fungible Tokens
    * @param _to Fungible Token receiver
    * @param _amount Quantity of transferable Fungible Tokens
    */
    function transfer(
        address _to,
        uint256 _amount
    ) 
        public 
        returns (bool) 
    {
        require(_amount <= _balances[msg.sender]);
        require(_to != address(0));

        _balances[msg.sender] = _balances[msg.sender].sub(_amount);
        _balances[_to] = _balances[_to].add(_amount);
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    /**
    * @dev Approve specified amount of Fungible Tokens to be managed by operator
    * @param _operator ETH address of operator
    * @param _amount Approval Fungible Token amount
    */
    function approve(
        address _operator,
        uint256 _amount
    )
        public 
        returns (bool) 
    {
        require(_operator != address(0));
        _allowed[msg.sender][_operator] = _amount;
        emit Approval(msg.sender, _operator, _amount);
        return true;
    }

    /**
    * @dev Transfer specified amount of Fungible Tokens from included address
    * @param _from Address of Fungible Token holder
    * @param _to Address of Fungible Token receiver
    * @param _amount Quantity of transferable Fungible Tokens
    */
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    )
        public 
        returns (bool) 
    {
        require(_amount <= _balances[_from]);
        require(_amount <= _allowed[_from][msg.sender]);
        require(_to != address(0));

        _balances[_from] = _balances[_from].sub(_amount);
        _balances[_to] = _balances[_to].add(_amount);
        _allowed[_from][msg.sender] = _allowed[_from][msg.sender].sub(_amount);
        emit Transfer(_from, _to, _amount);
        return true;
    }

    /**
    * @dev Increase approval amount of Fungible Tokens for specified operator
    * @param _operator ETH address of Fungible Token operator
    * @param _addedAmount Quantity of increased approval Fungible Tokens
    */
    function increaseAllowance(
        address _operator,
        uint256 _addedAmount
    )
        public 
        returns (bool) 
    {
        require(_operator != address(0));
        _allowed[msg.sender][_operator] = (
            _allowed[msg.sender][_operator].add(_addedAmount)
        );
        emit Approval(msg.sender, _operator, _allowed[msg.sender][_operator]);
        return true;
    }

    /**
    * @dev Decrease approval amount of Fungible Tokens for specified operator
    * @param _operator ETH address of Fungible Token operator
    * @param _substractedAmount Quantity of decreased approval Fungible Tokens
    */
    function decreaseAllowance(
        address _operator,
        uint256 _substractedAmount
    )
        public 
        returns (bool) 
    {
        require(_operator != address(0));
        _allowed[msg.sender][_operator] = (
            _allowed[msg.sender][_operator].sub(_substractedAmount)
        );
        emit Approval(msg.sender, _operator, _allowed[msg.sender][_operator]);
        return true;
    }

    /**
    * @dev Check allowed Fungible Token amount by token holder to operator
    * @param _owner ETH address of Fungible token holder
    * @param _operator ETH address of Fungible token operator
    */
    function allowance(
        address _owner,
        address _operator
    )  
        public 
        view 
        returns (uint256) 
    {
       return _allowed[_owner][_operator];
    }
}