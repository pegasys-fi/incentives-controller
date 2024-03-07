// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

import {IStakedPSYS} from '@pollum-io/pegasys-stake/contracts/interfaces/IStakedPSYS.sol';

interface IStakedTokenWithConfig is IStakedPSYS {
  function STAKED_TOKEN() external view returns(address);
}