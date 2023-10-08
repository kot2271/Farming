# Farming

## Задача:

- Максимальная продолжительность: 3 месяца (farming)
- Токен для пополнения счета: LP-токен
- Максимальная общая сумма для ставки: 1000 LP-токенов
- Процент ставки: 10% в месяц
- Токен для вознаграждения: ERC20

## Задание:

- Дописать функции `withdraw` и `claimRewards`;
- Написать test, task, scripts.
- Переделать `hardhat.config.ts`
- Задеплоить в `mumbai` 2 erc20, 1 farming contract. Не обязательно создавать LP токен в `mumbai` можно создать 1 reward token и 1 staking token.
- Верифицировать контракты

## Installation
Clone the repository using the following command:
Install the dependencies using the following command:
```shell
npm i
```

## Deployment

Fill in all the required environment variables(copy .env-example to .env and fill it). 

Deploy contract to the chain (polygon-mumbai):
```shell
npx hardhat run scripts/deploy.ts --network polygon-mumbai
```

## Tasks

Create a new task(s) and save it(them) in the folder "tasks". Add a new task_name in the file "tasks/index.ts"

Running a approve task:
```shell
npx hardhat approve --reward-token {REWARD_TOKEN_ADDRESS} --farming-contract {FARMING_CONTRACT_ADDRESS} --network polygon-mumbai
```

Running a initializeFarming task:
```shell
npx hardhat initializeFarming --farming-contract {FARMING_CONTRACT_ADDRESS} --network polygon-mumbai
```

Running a approveStaking task:
```shell
npx hardhat approveStaking --staking-token {STAKING_TOKEN_ADDRESS} --farming-contract {FARMING_CONTRACT_ADDRESS} --amount 1000 --network polygon-mumbai
```

Running a deposit task:
```shell
npx hardhat deposit --farming-contract {FARMING_CONTRACT_ADDRESS} --amount 1000 --network polygon-mumbai
```

Running a claim task:
```shell
npx hardhat claim --farming-contract {FARMING_CONTRACT_ADDRESS} --network polygon-mumbai
```

Running a withdraw task:
```shell
npx hardhat withdraw --contract {FARMING_CONTRACT_ADDRESS} --network polygon-mumbai
```

## Verify

Verify the installation by running the following command:
```shell
npx hardhat verify --network polygon-mumbai {STAKING_TOKEN_ADDRESS} "StakingToken" "STT"
```

```shell
npx hardhat verify --network polygon-mumbai {REWARD_TOKEN_ADDRESS} "RewardToken" "RWT"
```

```shell
npx hardhat verify --network polygon-mumbai {FARMING_CONTRACT_ADDRESS} {STAKING_TOKEN_ADDRESS} {REWARD_TOKEN_ADDRESS}
```

{REWARD_TOKEN_ADDRESS}: 0x2FE4eaB8BbBE1C6097C3f63b470B7C17eBBf1F8D
{STAKING_TOKEN_ADDRESS}: 0x5A6806908f1652a394EC53EC0934DA67dC0B5a6a
{FARMING_CONTRACT_ADDRESS}: 0x8DCe885Ffb72F4f019f1212a4c06349Ff4B1AFda