//SPDX-License-Identifier: Unlicense
pragma solidity =0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Farming {
    using SafeERC20 for IERC20Metadata;

    struct User {
        uint256 amount;
        uint256 depositTime;
        bool claimed;
    }

    uint256 public constant HUNDRED_PERCENT = 10_000; // 100.00%

    address public owner;

    IERC20Metadata public stakingToken; // LP token

    IERC20Metadata public rewardToken; // token A or erc20

    uint256 public tokensLeft;

    uint256 public percentage;

    uint256 public startTime;

    uint256 public epochDuration;

    uint256 public amountOfEpochs;

    bool public initialized;

    mapping (address => User) public users;

    event Deposited(address addr, uint256 amount);
    event Withdraw(address addr);
    event Claimed(address addr, uint256 amount);

    constructor(address _stakingToken, address _rewardToken) {
        owner = msg.sender;
        stakingToken = IERC20Metadata(_stakingToken);
        rewardToken = IERC20Metadata(_rewardToken);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    function initialize(
        uint256 _totalAmount,
        uint256 _percentage, // 0 ~ 100.00% => 0 ~ 10000
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
            ((_totalAmount * _percentage * _amountOfEpochs) / HUNDRED_PERCENT)
        );
    }

    function deposit(uint256 _amount) external {
        require(startTime <= block.timestamp, "Farming is not up yet!");
        require(_amount <= tokensLeft, "Too many tokens contributed");
        users[msg.sender] = User({
            amount: _amount,
            depositTime: block.timestamp,
            claimed: false
        });
        tokensLeft -= _amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
        emit Deposited(msg.sender, _amount);
    }

    function withdraw() external {
        User storage user = users[msg.sender];

        require(user.claimed, "Rewards not claimed");

        uint256 amount = user.amount;
        user.amount = 0;

        stakingToken.safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender);
    }

    function claimRewards() external {
        User storage user = users[msg.sender];

        require(block.timestamp >= startTime + epochDuration * amountOfEpochs, "Epoch not finished");
        require(!user.claimed, "Rewards already claimed");

        uint256 amount = user.amount;
        uint256 timeDelta = block.timestamp - user.depositTime;
        uint256 epochsPassed = timeDelta / epochDuration;
        uint256 reward = (amount * percentage * epochsPassed) / HUNDRED_PERCENT;

        user.claimed = true;
        
        rewardToken.safeTransfer(msg.sender, reward);

        emit Claimed(msg.sender, reward);
    }
}