import { ethers } from 'ethers';

export const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}