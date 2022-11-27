const SHA256 = require("crypto-js/sha256");

const DIFF = 3;

class Block {
  constructor(timestamp, txns, previousHash) {
    this.timestamp = timestamp;
    this.txns = txns;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    ).toString();
  }
  mineBlock(difficulty) {
    let count = 0;
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce += 1;
      count += 1;
      this.hash = this.calculateHash();
    }
    console.log(
      `Successfully hashed block with ${count} NONCE. HASH: ${this.hash}`
    );
  }
}

class BlockChain {
  constructor() {
    this.chain = [];
    this.difficulty = DIFF;
    this.unminedTxns = [];
    this.miningReward = 10;
    this.registeredAddresses = [
      "wallet-James",
      "wallet-Nora",
      "wallet-Miner69er",
      "wallet-Miner70er",
    ];
    this.createGenesisBlock();
    this.airdropCoins(10000);
  }
  airdropCoins(coins) {
    for (const address of this.registeredAddresses) {
      let txn = new Transaction(Date.now(), "mint", address, coins);
      this.unminedTxns.push(txn);
    }
    this.mineCurrentBlock("wallet-Miner69er");
  }
  createGenesisBlock() {
    let txn = new Transaction(Date.now(), "mint", "genesis", 0);
    let block = new Block(Date.now(), [txn], "0");
    this.chain.push(block);
  }
  getlatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  //   addBlock(newBlock) {
  //     newBlock.previousHash = this.getlatestBlock().hash;
  //     newBlock.mineBlock(this.difficulty);
  //     this.chain.push(newBlock);
  //   }
  mineCurrentBlock(minerAddress) {
    let validatedTxns = [];
    for (const txn of this.unminedTxns) {
      if (txn.payerAddress === "mint" || this.validateTransaction(txn)) {
        validatedTxns.push(txn);
      }
    }
    console.log("transaction validated: " + validatedTxns.length);
    let block = new Block(
      Date.now(),
      validatedTxns,
      this.getlatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log("Current Block successfully mined...");
    this.chain.push(block);

    //Reset Unmined Transactions + reward the miner
    this.unminedTxns = [
      new Transaction(Date.now(), "mint", minerAddress, this.miningReward),
    ];
  }

  validateTransaction(txn) {
    let payerAddress = txn.payerAddress;
    let balance = this.getAddressBalance(payerAddress);
    if (balance >= txn.amount) {
      return true;
    } else {
      return false;
    }
  }

  createTransaction(txn) {
    this.unminedTxns.push(txn);
  }
  getAddressBalance(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const txn of block.txns) {
        if (txn.payerAddress === address) {
          balance -= txn.amount;
        }
        if (txn.payeeAddress === address) {
          balance += txn.amount;
        }
      }
    }
    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Validate Data Intregity
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Validate Hash Chain Link
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    // All is good
    return true;
  }
}

class Transaction {
  constructor(timestamp, payerAddress, payeeAddress, amount) {
    this.timestamp = timestamp;
    this.payerAddress = payerAddress;
    this.payeeAddress = payeeAddress;
    this.amount = amount;
  }
}

let demoCoin = new BlockChain();
// 1st Block
demoCoin.createTransaction(
  new Transaction(Date.now(), "wallet-James", "wallet-Nora", 50000)
);
demoCoin.createTransaction(
  new Transaction(Date.now(), "wallet-Nora", "wallet-James", 2500)
);
console.log("\nThe block is mining...");
demoCoin.mineCurrentBlock("wallet-Miner69er");

console.log("\nBalance: James: " + demoCoin.getAddressBalance("wallet-James"));
console.log("\nBalance: Nora: " + demoCoin.getAddressBalance("wallet-Nora"));
console.log(
  "\nBalance: Miner69er: " + demoCoin.getAddressBalance("wallet-Miner69er")
);
console.log(
  "Unmined Transactions: " +
    demoCoin.unminedTxns[0].amount +
    " of " +
    demoCoin.unminedTxns[0].payeeAddress
);
// 2nd Block
demoCoin.createTransaction(
  new Transaction(Date.now(), "wallet-James", "wallet-Nora", 5000)
);
demoCoin.createTransaction(
  new Transaction(Date.now(), "wallet-Nora", "wallet-James", 2500)
);
console.log("\nThe block is mining...");
demoCoin.mineCurrentBlock("wallet-Miner70er");

console.log("\nBalance: James: " + demoCoin.getAddressBalance("wallet-James"));
console.log("\nBalance: Nora: " + demoCoin.getAddressBalance("wallet-Nora"));
console.log(
  "\nBalance: Miner69er: " + demoCoin.getAddressBalance("wallet-Miner69er")
);
console.log(
  "Unmined Transactions: " +
    demoCoin.unminedTxns[0].amount +
    " of " +
    demoCoin.unminedTxns[0].payeeAddress
);
// let demoChain = new BlockChain();
// console.log("Starting to mine a new block...");
// demoChain.addBlock(
//   new Block(1, "26/11/22", {
//     amount: 10,
//   })
// );
// console.log("Starting to mine a new block...");
// demoChain.addBlock(
//   new Block(2, "27/11/22", {
//     amount: 20,
//   })
// );
// console.log(JSON.stringify(demoChain, null, 4));
// console.log("Is chain valid? " + demoChain.isChainValid());
