// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IERC20.sol";

contract AMMPool {
    IERC20 public tokenA; // USDC
    IERC20 public tokenB; // EURC

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 private constant FEE_NUM = 997;
    uint256 private constant FEE_DEN = 1000;

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "zero amount");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        reserveA = tokenA.balanceOf(address(this));
        reserveB = tokenB.balanceOf(address(this));
    }

    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256) {
        require(amountIn > 0, "zero input");
        require(reserveIn > 0 && reserveOut > 0, "no liquidity");

        uint256 amountInWithFee = amountIn * FEE_NUM;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * FEE_DEN + amountInWithFee;
        return numerator / denominator;
    }

    function swap(
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external {
        require(amountIn > 0, "zero amount");

        bool isTokenA = tokenIn == address(tokenA);
        require(isTokenA || tokenIn == address(tokenB), "invalid token");

        if (isTokenA) {
            tokenA.transferFrom(msg.sender, address(this), amountIn);
            uint256 amountOut = getAmountOut(amountIn, reserveA, reserveB);
            require(amountOut >= minAmountOut, "slippage");

            tokenB.transfer(msg.sender, amountOut);
        } else {
            tokenB.transferFrom(msg.sender, address(this), amountIn);
            uint256 amountOut = getAmountOut(amountIn, reserveB, reserveA);
            require(amountOut >= minAmountOut, "slippage");

            tokenA.transfer(msg.sender, amountOut);
        }

        reserveA = tokenA.balanceOf(address(this));
        reserveB = tokenB.balanceOf(address(this));
    }
}
