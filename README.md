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

Deploy contract to the chain (goerli testnet):
```shell
npx hardhat run scripts/deploy.ts --network polygon-mumbai
```

## Tasks

Create a new task(s) and save it(them) in the folder "tasks". Add a new task_name in the file "tasks/index.ts"

Running a configureFarming task:
```shell
npx hardhat configure-farming --contract {FARMING_CONTRACT_ADDRESS} --network polygon-mumbai
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
