# Dapplet Contracts

Contracts for Dapplet; an ecosystem for collaborative dApp development and end-user dApp composability.

## Boot up dev env (part 1):

1. `npx hardhat node`
2. `npx hardhat run scripts/deploy.ts --network localhost`
3. `npx hardhat test --network localhost`
4. open the [interface](https://github.com/dapplet/interface) and continue following the directions in that README.

### Deploying on Live Network (Goerli, Mainnet)

- in https://app.ens.domains
  1. Delete registered subdomains (ex: **name**.root.eth) on the rootNode (ex: root.eth), otherwise tests will fail if 'name' in createClient('name') is already a registered subdomain.
  2. Reset the ENS Controller to match the Registrant, otherwise we cannot set the Controller to the System Diamond.

---

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
GAS_REPORT=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
