// SPDX-License-Identifier: Unlicense
pragma solidity =0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Farming {
    using SafeMath for uint256;
    using SafeERC20 for IERC20Metadata;

    struct User {
        uint256 amount;
        uint256 depositTime;
        bool claimed;
    }

    uint256 public constant HUNDRED_PERCENT = 10_000; // 100.00%

    address public owner;

    IERC20Metadata public stakingToken; // LP token
    IERC20Metadata public rewardToken;  // token A or erc20

    uint256 public tokensLeft;

    uint256 public totalRewards;

    uint256 public percentage;

    uint256 public startTime;

    uint256 public epochDuration;

    uint256 public amountOfEpochs;

    bool public initialized;

    mapping(address => User) public users;

    event Deposited(address indexed addr, uint256 amount);
    event Withdrawn(address indexed addr, uint256 amount);
    event RewardClaimed(address indexed addr, uint256 amount);

    constructor(address _stakingToken, address _rewardToken) {
        owner = msg.sender;
        stakingToken = IERC20Metadata(_stakingToken);
        rewardToken = IERC20Metadata(_rewardToken);
    }

    function initialize(
        uint256 _totalAmount,
        uint256 _percentage,
        uint256 _epochDuration,
        uint256 _amountOfEpochs,
        uint256 _startTime
    ) external onlyOwner {
        require(!initialized, "Already initialized");
        initialized = true;
        tokensLeft = _totalAmount;
        percentage = _percentage;
        startTime = _startTime;
        amountOfEpochs = _amountOfEpochs;
        epochDuration = _epochDuration;

        rewardToken.safeTransferFrom(
            msg.sender, 
            address(this),
            (_totalAmount.mul(_percentage).mul(_amountOfEpochs)).div(HUNDRED_PERCENT)
        );
    }

    function deposit(uint256 _amount) external {
        require(startTime <= block.timestamp, "Farming is not up yet!");
        require(_amount <= tokensLeft, "Too many tokens contributed");

        users[msg.sender].amount += _amount;
        users[msg.sender].depositTime = block.timestamp;

        tokensLeft -= _amount;

        stakingToken.transferFrom(msg.sender, address(this), _amount);
        emit Deposited(msg.sender, _amount);
    }

    function withdraw() external {
        require(users[msg.sender].claimed, "Rewards not claimed");
        uint256 amount = users[msg.sender].amount;
        users[msg.sender].amount = 0;

        stakingToken.transfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }

    function claimRewards() external {
        require(block.timestamp >= users[msg.sender].depositTime + epochDuration * amountOfEpochs, "Epoch not finished");
        require(!users[msg.sender].claimed, "Rewards already claimed");

        uint256 reward = calculateReward(msg.sender);
        users[msg.sender].claimed = true;
        totalRewards += reward;

        rewardToken.transfer(msg.sender, reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function calculateReward(address addr) public view returns (uint256) {
        return (users[addr].amount.mul(percentage).mul(amountOfEpochs)).div(HUNDRED_PERCENT);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner");
        _;
    }
}