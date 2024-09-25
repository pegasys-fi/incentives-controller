import BigNumber from 'bignumber.js';

export interface SymbolMap<T> {
  [symbol: string]: T;
}

export type eNetwork = eEthereumNetwork;

export enum eContractid {
  DistributionManager = 'DistributionManager',
  PegasysIncentivesController = 'PegasysIncentivesController',
  MintableErc20 = 'MintableErc20',
  ATokenMock = 'ATokenMock',
  IERC20Detailed = 'IERC20Detailed',
  StakedTokenIncentivesController = 'StakedTokenIncentivesController',
  MockSelfDestruct = 'MockSelfDestruct',
  StakedPegasysV3 = 'StakedPegasysV3',
  PullRewardsIncentivesController = 'PullRewardsIncentivesController',
}

export enum eEthereumNetwork {
  main = 'main',
  hardhat = 'hardhat',
}


export enum EthereumNetworkNames {
  main = 'main',
}

export type iParamsPerNetwork<T> =
  | iEthereumParamsPerNetwork<T>;

export interface iEthereumParamsPerNetwork<T> {
  [eEthereumNetwork.main]: T;
  [eEthereumNetwork.hardhat]: T;
}

export type tEthereumAddress = string;
export type tStringTokenBigUnits = string; // 1 ETH, or 10e6 USDC or 10e18 DAI
export type tBigNumberTokenBigUnits = BigNumber;
export type tStringTokenSmallUnits = string; // 1 wei, or 1 basic unit of USDC, or 1 basic unit of DAI
export type tBigNumberTokenSmallUnits = BigNumber;
