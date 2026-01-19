// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./AMMPool.sol";

contract Router {
    AMMPool public pool;

    constructor(address _pool) {
        pool = AMMPool(_pool);
    }

    function getAmountOut(address tokenIn, uint256 amountIn)
        external
        view
        returns (uint256)
    {
        uint256 rA = pool.reserveA();
        uint256 rB = pool.reserveB();

        if (tokenIn == address(pool.tokenA())) {
            return pool.getAmountOut(amountIn, rA, rB);
        } else {
            return pool.getAmountOut(amountIn, rB, rA);
        }
    }
}
