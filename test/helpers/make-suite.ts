import { evmRevert, evmSnapshot, DRE } from '../../helpers/misc-utils';
import { Signer } from 'ethers';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import { tEthereumAddress } from '../../helpers/types';

import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import { getATokenMock } from '../../helpers/contracts-accessors';
import { MintableErc20 } from '../../types/MintableErc20';
import { ATokenMock } from '../../types/ATokenMock';
import {
  PullRewardsIncentivesController,
  PullRewardsIncentivesController__factory,
  StakedPegasysV3,
  StakedTokenIncentivesController,
} from '../../types';

chai.use(bignumberChai());

export let stakedPSYSInitializeTimestamp = 0;
export const setStakedPegasysInitializeTimestamp = (timestamp: number) => {
  stakedPSYSInitializeTimestamp = timestamp;
};

export interface SignerWithAddress {
  signer: Signer;
  address: tEthereumAddress;
}
export interface TestEnv {
  rewardsVault: SignerWithAddress;
  deployer: SignerWithAddress;
  users: SignerWithAddress[];
  psysToken: MintableErc20;
  pegasysIncentivesController: StakedTokenIncentivesController;
  pullRewardsIncentivesController: PullRewardsIncentivesController;
  stakedPSYS: StakedPegasysV3;
  aDaiMock: ATokenMock;
  aWethMock: ATokenMock;
  aDaiBaseMock: ATokenMock;
  aWethBaseMock: ATokenMock;
}

let buidlerevmSnapshotId: string = '0x1';
const setBuidlerevmSnapshotId = (id: string) => {
  if (DRE.network.name === 'hardhat') {
    buidlerevmSnapshotId = id;
  }
};

const testEnv: TestEnv = {
  deployer: {} as SignerWithAddress,
  users: [] as SignerWithAddress[],
  psysToken: {} as MintableErc20,
  stakedPSYS: {} as StakedPegasysV3,
  pegasysIncentivesController: {} as StakedTokenIncentivesController,
  pullRewardsIncentivesController: {} as PullRewardsIncentivesController,
  aDaiMock: {} as ATokenMock,
  aWethMock: {} as ATokenMock,
  aDaiBaseMock: {} as ATokenMock,
  aWethBaseMock: {} as ATokenMock,
} as TestEnv;

export async function initializeMakeSuite(
  psysToken: MintableErc20,
  stakedPSYS: StakedPegasysV3,
  pegasysIncentivesController: StakedTokenIncentivesController,
  pullRewardsIncentivesController: PullRewardsIncentivesController
) {
  const [_deployer, _proxyAdmin, ...restSigners] = await getEthersSigners();
  const deployer: SignerWithAddress = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };

  const rewardsVault: SignerWithAddress = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };

  for (const signer of restSigners) {
    testEnv.users.push({
      signer,
      address: await signer.getAddress(),
    });
  }
  testEnv.deployer = deployer;
  testEnv.rewardsVault = rewardsVault;
  testEnv.stakedPSYS = stakedPSYS;
  testEnv.pegasysIncentivesController = pegasysIncentivesController;
  testEnv.pullRewardsIncentivesController = pullRewardsIncentivesController;
  testEnv.psysToken = psysToken;
  testEnv.aDaiMock = await getATokenMock({ slug: 'aDai' });
  testEnv.aWethMock = await getATokenMock({ slug: 'aWeth' });
  testEnv.aDaiBaseMock = await getATokenMock({ slug: 'aDaiBase' });
  testEnv.aWethBaseMock = await getATokenMock({ slug: 'aWethBase' });
}

export function makeSuite(name: string, tests: (testEnv: TestEnv) => void) {
  describe(name, () => {
    before(async () => {
      setBuidlerevmSnapshotId(await evmSnapshot());
    });
    tests(testEnv);
    after(async () => {
      await evmRevert(buidlerevmSnapshotId);
    });
  });
}
