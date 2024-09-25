import { expect } from 'chai';
import { MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../../helpers/constants';
import { waitForTx } from '../../helpers/misc-utils';

import { makeSuite, TestEnv } from '../helpers/make-suite';

makeSuite('PegasysIncentivesController - Claim rewards on behalf', (testEnv: TestEnv) => {
  it('Should setClaimer revert if not called by emission manager', async () => {
    const { pegasysIncentivesController, users } = testEnv;
    const [userWithRewards, thirdClaimer] = users;
    await expect(
      pegasysIncentivesController
        .connect(userWithRewards.signer)
        .setClaimer(userWithRewards.address, thirdClaimer.address)
    ).to.be.revertedWith('ONLY_EMISSION_MANAGER');
  });
  it('Should claimRewardsOnBehalf revert if called claimer is not authorized', async () => {
    const { pegasysIncentivesController, users, aDaiMock, stakedPSYS } = testEnv;
    const [userWithRewards, thirdClaimer] = users;

    await waitForTx(await pegasysIncentivesController.configureAssets([aDaiMock.address], ['2000']));
    await waitForTx(await aDaiMock.setUserBalanceAndSupply('300000', '30000'));

    // Claim from third party claimer
    const priorStkBalance = await stakedPSYS.balanceOf(thirdClaimer.address);

    await expect(
      pegasysIncentivesController
        .connect(thirdClaimer.signer)
        .claimRewardsOnBehalf(
          [aDaiMock.address],
          MAX_UINT_AMOUNT,
          userWithRewards.address,
          thirdClaimer.address
        )
    ).to.be.revertedWith('CLAIMER_UNAUTHORIZED');

    const afterStkBalance = await stakedPSYS.balanceOf(thirdClaimer.address);
    expect(afterStkBalance).to.be.eq(priorStkBalance);
  });
  it('Should setClaimer pass if called by emission manager', async () => {
    const { pegasysIncentivesController, users, rewardsVault } = testEnv;
    const [userWithRewards, thirdClaimer] = users;
    const emissionManager = rewardsVault;

    await expect(
      pegasysIncentivesController
        .connect(emissionManager.signer)
        .setClaimer(userWithRewards.address, thirdClaimer.address)
    )
      .to.emit(pegasysIncentivesController, 'ClaimerSet')
      .withArgs(userWithRewards.address, thirdClaimer.address);
    await expect(await pegasysIncentivesController.getClaimer(userWithRewards.address)).to.be.equal(
      thirdClaimer.address
    );
  });
  it('Should claimRewardsOnBehalf pass if called by the assigned claimer', async () => {
    const { pegasysIncentivesController, users, aDaiMock, stakedPSYS } = testEnv;
    const [userWithRewards, thirdClaimer] = users;

    await waitForTx(await pegasysIncentivesController.configureAssets([aDaiMock.address], ['2000']));
    await waitForTx(await aDaiMock.setUserBalanceAndSupply('300000', '30000'));

    // Claim from third party claimer
    const priorStkBalance = await stakedPSYS.balanceOf(thirdClaimer.address);

    await expect(
      pegasysIncentivesController
        .connect(thirdClaimer.signer)
        .claimRewardsOnBehalf(
          [aDaiMock.address],
          MAX_UINT_AMOUNT,
          userWithRewards.address,
          thirdClaimer.address
        )
    )
      .to.emit(pegasysIncentivesController, 'RewardsClaimed')
      .withArgs(userWithRewards.address, thirdClaimer.address, thirdClaimer.address, '99999');
    const afterStkBalance = await stakedPSYS.balanceOf(thirdClaimer.address);
    expect(afterStkBalance).to.be.gt(priorStkBalance);
  });

  it('Should claimRewardsOnBehalf revert if to argument address is ZERO_ADDRESS', async () => {
    const { pegasysIncentivesController, users, aDaiMock, stakedPSYS } = testEnv;
    const [userWithRewards, thirdClaimer] = users;

    await waitForTx(await pegasysIncentivesController.configureAssets([aDaiMock.address], ['2000']));
    await waitForTx(await aDaiMock.setUserBalanceAndSupply('300000', '30000'));

    await expect(
      pegasysIncentivesController
        .connect(thirdClaimer.signer)
        .claimRewardsOnBehalf(
          [aDaiMock.address],
          MAX_UINT_AMOUNT,
          userWithRewards.address,
          ZERO_ADDRESS
        )
    ).to.be.revertedWith('INVALID_TO_ADDRESS');
  });

  it('Should claimRewardsOnBehalf revert if user argument is ZERO_ADDRESS', async () => {
    const { pegasysIncentivesController, users, aDaiMock, rewardsVault } = testEnv;
    const [, thirdClaimer] = users;

    const emissionManager = rewardsVault;

    await waitForTx(await pegasysIncentivesController.configureAssets([aDaiMock.address], ['2000']));
    await waitForTx(await aDaiMock.setUserBalanceAndSupply('300000', '30000'));

    await expect(
      pegasysIncentivesController
        .connect(emissionManager.signer)
        .setClaimer(ZERO_ADDRESS, thirdClaimer.address)
    )
      .to.emit(pegasysIncentivesController, 'ClaimerSet')
      .withArgs(ZERO_ADDRESS, thirdClaimer.address);

    await expect(
      pegasysIncentivesController
        .connect(thirdClaimer.signer)
        .claimRewardsOnBehalf(
          [aDaiMock.address],
          MAX_UINT_AMOUNT,
          ZERO_ADDRESS,
          thirdClaimer.address
        )
    ).to.be.revertedWith('INVALID_USER_ADDRESS');
  });
});
