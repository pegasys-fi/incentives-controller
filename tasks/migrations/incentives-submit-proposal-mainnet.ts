import { formatEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';
import { DRE, impersonateAccountsHardhat, latestBlock } from '../../helpers/misc-utils';
import { IERC20__factory, IGovernancePowerDelegationToken__factory } from '../../types';
import { IPegasysGovernanceV2 } from '../../types/IPegasysGovernanceV2';
import { getDefenderRelaySigner } from '../../helpers/defender-utils';
import isIPFS from 'is-ipfs';
import { Signer } from '@ethersproject/abstract-signer';

const {
  PSYS_TOKEN = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  PSYS_GOVERNANCE_V2 = '0xEC568fffba86c094cf06b22134B23074DFE2252c', // mainnet
  PSYS_SHORT_EXECUTOR = '0xee56e2b3d491590b5b31738cc34d5232f378a8d5', // mainnet
} = process.env;

task('incentives-submit-proposal:mainnet', 'Submit the incentives proposal toPegasys Governance')
  .addParam('proposalExecutionPayload')
  .addParam('aTokens')
  .addParam('variableDebtTokens')
  .addFlag('defender')
  .setAction(
    async ({ defender, proposalExecutionPayload, aTokens, variableDebtTokens }, localBRE) => {
      await localBRE.run('set-DRE');
      let proposer: Signer;
      [proposer] = await DRE.ethers.getSigners();

      if (defender) {
        const { signer } = await getDefenderRelaySigner();
        proposer = signer;
      }

      if (!PSYS_TOKEN || !PSYS_GOVERNANCE_V2 || !PSYS_SHORT_EXECUTOR) {
        throw new Error(
          'You have not set correctly the .env file, make sure to read the README.md'
        );
      }

      if (aTokens.split(',').length !== 6) {
        throw new Error('aTokens input param should have 6 elements');
      }

      if (variableDebtTokens.split(',').length !== 6) {
        throw new Error('variable debt token param should have 6 elements');
      }

      const proposerAddress = await proposer.getAddress();

      // Initialize contracts and tokens
      const gov = (await DRE.ethers.getContractAt(
        'IPegasysGovernanceV2',
        PSYS_GOVERNANCE_V2,
        proposer
      )) as IPegasysGovernanceV2;

      const psys = IERC20__factory.connect(PSYS_TOKEN, proposer);

      // Balance and proposal power check
      const balance = await psys.balanceOf(proposerAddress);
      const priorBlock = ((await latestBlock()) - 1).toString();
      const pegasysGovToken = IGovernancePowerDelegationToken__factory.connect(PSYS_TOKEN, proposer);
      const propositionPower = await pegasysGovToken.getPowerAtBlock(proposerAddress, priorBlock, '1');

      console.log('- PSYS Balance proposer', formatEther(balance));
      console.log(
        `- Proposition power of ${proposerAddress} at block: ${priorBlock}`,
        formatEther(propositionPower)
      );

      // Submit proposal
      const proposalId = await gov.getProposalsCount();
      const proposalParams = {
        proposalExecutionPayload,
        aTokens,
        variableDebtTokens,
        pegasysGovernance: PSYS_GOVERNANCE_V2,
        shortExecutor: PSYS_SHORT_EXECUTOR,
        defender: true,
      };
      console.log('- Submitting proposal with following params:');
      console.log(JSON.stringify(proposalParams, null, 2));

      await DRE.run('propose-incentives', proposalParams);
      console.log('- Proposal Submited:', proposalId.toString());
    }
  );
